import { Body, Controller, Param, Post, Sse } from '@nestjs/common';
import * as crypto from 'crypto';
import { finalize } from 'rxjs';
import { RabbitMQService } from 'src/config/rabbitmq/rabbitmq.service';
import { SseService } from './sse.service';

@Controller('eval')
export class EvalController {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly sseService: SseService
  ) { }

  @Post()
  async eval(@Body() body: { code: string }) {
    const jobId = crypto.randomUUID();

    await this.rabbitMQService.publish('code-eval', {
      jobId,
      code: body.code,
    });

    return { jobId };
  }

  @Sse(':jobId/stream')
  async stream(
    @Param('jobId') jobId: string
  ) {
    const subject = this.sseService.register(jobId)

    return subject.pipe(
      finalize(() => this.sseService.remove(jobId))
    )
  }
}