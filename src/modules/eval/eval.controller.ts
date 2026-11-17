import { Body, Controller, Logger, Param, ParseUUIDPipe, Post, Sse, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@shared/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { CheckSupportDto } from './dto/check-support.dto';
import { EvalResponseDto } from './dto/eval-response.dto';
import { EvalDto } from './dto/eval.dto';
import { EvalService } from './eval.service';
import { SseService } from './sse.service';

@Controller('eval')
export class EvalController {
  private readonly logger = new Logger(EvalController.name);

  constructor(
    private readonly evalService: EvalService,
    private readonly sseService: SseService,
  ) { }

  @Post('check')
  async checkSupport(@Body() dto: CheckSupportDto) {
    return this.evalService.checkSupport(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/tasks/:taskId')
  async eval(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: EvalDto,
    @CurrentUser('id') userId: string,
  ): Promise<EvalResponseDto> {
    return this.evalService.dispatch(userId, taskId, dto);
  }

  @Sse(':jobId/stream')
  stream(@Param('jobId') jobId: string) {
    this.logger.log(`SSE stream opened for jobId=${jobId}`);
    return this.sseService.subscribe(jobId);
  }
}