import { Body, Controller, Logger, Param, Post, Sse } from '@nestjs/common';
import * as crypto from 'crypto';
import { RabbitMQService } from 'src/config/rabbitmq/rabbitmq.service';
import { CheckSupportDto } from './dto/check-support.dto';
import { EvalDto } from './dto/eval.dto';
import { EvalService } from './eval.service';
import { SseService } from './sse.service';

@Controller('eval')
export class EvalController {
  private readonly logger = new Logger(EvalController.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly sseService: SseService,
    private readonly evalService: EvalService,
  ) { }

  @Post('check')
  async checkSupport(@Body() dto: CheckSupportDto) {
    this.logger.log(`Received check-support request for ${dto.tasks.length} tasks`);

    const results = await Promise.allSettled(
      dto.tasks.map((task) =>
        this.evalService.eval({
          language: 'go',
          code: task.code,
          testCases: task.testCases,
        }),
      ),
    );

    this.logger.log(`Check-support finished`);

    return dto.tasks.map((task, index) => {
      const res = results[index];
      if (res.status === 'fulfilled') {
        return { name: task.name, status: 'fulfilled', result: res.value };
      }

      const message = res.reason instanceof Error ? res.reason.message : String(res.reason);
      this.logger.error(`Task "${task.name}" rejected: ${message}`);

      return { name: task.name, status: 'rejected', error: message };
    });
  }

  @Post()
  async eval(@Body() dto: EvalDto) {
    const { code, language, testCases } = dto;

    const jobId = crypto.randomUUID();
    this.logger.log(`Received eval request: jobId=${jobId}, language=${language}`);

    await this.rabbitMQService.publish('code-eval', {
      jobId,
      code,
      language,
      testCases,
    });

    return { jobId };
  }

  @Sse(':jobId/stream')
  stream(@Param('jobId') jobId: string) {
    this.logger.log(`SSE stream opened for jobId=${jobId}`);
    return this.sseService.register(jobId);
  }
}