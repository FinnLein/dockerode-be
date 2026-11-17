import { Body, Controller, Logger, Param, Post, Sse } from '@nestjs/common';
import { EvalCollabDto } from './dto/eval-collab.dto';
import { EvalCollabService } from './eval-collab.service';
import { SseCollabService } from './sse-collab.service';

@Controller('eval/collab')
export class EvalCollabController {
  private readonly logger = new Logger(EvalCollabController.name);

  constructor(
    private readonly sseCollab: SseCollabService,
    private readonly evalCollabService: EvalCollabService,
  ) { }

  @Post()
  async evalCollab(@Body() dto: EvalCollabDto) {
    return this.evalCollabService.dispatch(dto);
  }

  @Sse('rooms/:roomId/stream')
  roomStream(@Param('roomId') roomId: string) {
    this.logger.log(`SSE stream opened for room=${roomId}`);
    return this.sseCollab.subscribe(roomId);
  }
}