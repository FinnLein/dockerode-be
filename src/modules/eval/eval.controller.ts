import { Body, Controller, Logger, Param, Post, Sse } from '@nestjs/common';
import * as crypto from 'crypto';
import { RabbitMQService } from 'src/config/rabbitmq/rabbitmq.service';
import { CheckSupportDto } from './dto/check-support.dto';
import { EvalResponseDto } from './dto/eval-response.dto';
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
    return this.evalService.checkSupport(dto);
  }

  @Post()
  async eval(@Body() dto: EvalDto): Promise<EvalResponseDto> {
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