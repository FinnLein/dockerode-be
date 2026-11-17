import { RedisService } from '@config/redis/redis.service';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { RabbitMQService } from 'src/config/rabbitmq/rabbitmq.service';
import { CodeRunnerService } from './code-runner/code-runner.service';
import { CheckSupportDto } from './dto/check-support.dto';
import { EvalDto } from './dto/eval.dto';

@Injectable()
export class EvalService {
  private readonly logger = new Logger(EvalService.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly codeRunnerService: CodeRunnerService,
    private readonly redisService: RedisService
  ) { }

  async dispatch(userId: string, taskId: string, dto: EvalDto) {
    const { code, language, testCases } = dto;

    const key = `${userId}:${taskId}`;
    const token = await this.redisService.acquire(key, 180);

    if (!token) {
      this.logger.warn(`Worker is already running`);
      throw new ConflictException('Прогон уже выполняется');
    }

    try {
      const jobId = crypto.randomUUID();

      this.logger.log(`Received eval request: jobId=${jobId}, language=${language}`);

      await this.rabbitMQService.publish('code-eval', {
        jobId,
        code,
        language,
        testCases,
        lockKey: key,
        lockToken: token,
      });

      return { jobId };
    } catch (error) {
      await this.redisService.release(key, token);
      throw error;
    }
  }

  async checkSupport(dto: CheckSupportDto) {
    this.logger.log(`Check-support: starting ${dto.tasks.length} tasks`);

    const results = await Promise.allSettled(
      dto.tasks.map(async (task) => {
        const { name, language, testCases, code } = task;
        const start = Date.now();

        this.logger.debug(`[START] ${name} (${language})`);

        try {
          const result = await this.codeRunnerService.eval({ language, code, testCases });
          const duration = Date.now() - start;

          this.logger.log(
            `[DONE] ${name} | ${result.success ? 'OK' : 'FAIL'} | ${duration}ms | passed=${result.passed}/${result.total}`,
          );

          if (result.stderr) {
            this.logger.warn(
              `[STDERR] ${name}: ${result.stderr.slice(0, 200)}...`,
            );
          }

          return result;
        } catch (error) {
          const duration = Date.now() - start;
          const message =
            error instanceof Error ? error.message : String(error);
          this.logger.error(`[FAILED] ${name} | ${duration}ms | ${message}`);
          throw error;
        }
      }),
    );

    this.logger.log(`Check-support: finished`);

    return dto.tasks.map((task, index) => {
      const res = results[index];
      if (res.status === 'fulfilled') {
        return { name: task.name, status: 'fulfilled', result: res.value };
      }
      const message =
        res.reason instanceof Error ? res.reason.message : String(res.reason);
      return { name: task.name, status: 'rejected', error: message };
    });
  }
}