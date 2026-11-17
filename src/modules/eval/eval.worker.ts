import { RedisService } from '@config/redis/redis.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from 'src/config/rabbitmq/rabbitmq.service';
import { CodeRunnerService } from './code-runner/code-runner.service';
import { SseService } from './sse.service';
import { TestCase } from './types/eval.types';

interface JobData {
  jobId: string;
  code: string;
  language: string;
  testCases: TestCase[];
  taskId: string
  lockKey: string
  lockToken: string
}

@Injectable()
export class EvalWorker implements OnModuleInit {
  private readonly logger = new Logger(EvalWorker.name);

  constructor(
    private readonly codeRunnerService: CodeRunnerService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly redisService: RedisService,
    private readonly sseService: SseService,
  ) { }

  async onModuleInit() {
    await this.rabbitMQService.consume('code-eval', async (msg) => {
      const { jobId, code, language, testCases, taskId, lockKey, lockToken } = msg as JobData

      this.logger.log(`Processing job ${jobId}`);


      this.sseService.publish(jobId, {
        data: { type: 'run_started', jobId }
      })

      try {
        const result = await this.codeRunnerService.eval({
          code,
          language,
          testCases,
        });

        this.logger.log(`Job ${jobId} finished: ${JSON.stringify(result)}`);

        this.sseService.publish(jobId, {
          data: { type: 'run_finished', result }
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Job ${jobId} failed: ${message}`);

        this.sseService.publish(jobId, {
          data: { type: 'run_failed', error: message }
        });

        throw error;
      } finally {
        await this.redisService.release(lockKey, lockToken)
      }
    });
  }
}
