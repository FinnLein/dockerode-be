import { RedisService } from '@config/redis/redis.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from 'src/config/rabbitmq/rabbitmq.service';
import { CodeRunnerService } from '../code-runner/code-runner.service';
import { SseCollabService } from './sse-collab.service';
import { TestCase } from '../types/eval.types';

@Injectable()
export class EvalCollabWorker implements OnModuleInit {
  private readonly logger = new Logger(EvalCollabWorker.name);

  constructor(
    private readonly codeRunnerService: CodeRunnerService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly sseCollab: SseCollabService,
    private readonly redisService: RedisService,
  ) { }

  async onModuleInit() {
    await this.rabbitMQService.consume('code-eval-collab', async (msg) => {
      const { jobId, code, language, testCases, roomId, token } = msg as {
        jobId: string;
        code: string;
        language: string;
        testCases: TestCase[];
        roomId: string
        token: string
      }

      this.logger.log(`Processing job ${jobId}`);

      this.sseCollab.publish(roomId, {
        data: { type: 'run_started', jobId }
      })

      try {
        const result = await this.codeRunnerService.eval({
          code,
          language,
          testCases,
        });

        this.logger.log(`Job ${jobId} finished: ${JSON.stringify(result)}`);

        this.sseCollab.publish(roomId, {
          data: { type: 'run_finished', result }
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        this.logger.error(`Job ${jobId} failed: ${message}`);

        this.sseCollab.publish(roomId, {
          data: { type: 'run_failed', error: message }
        });
      } finally {
        await this.redisService.release(roomId, token);
      }

    });
  }
}
