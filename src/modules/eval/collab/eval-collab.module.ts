import { RoomsModule } from '@modules/rooms/rooms.module';
import { Module } from '@nestjs/common';
import { CodeRunnerModule } from '../code-runner/code-runner.module';
import { EvalCollabController } from './eval-collab.controller';
import { EvalCollabService } from './eval-collab.service';
import { EvalCollabWorker } from './eval-collab.worker';
import { SseCollabService } from './sse-collab.service';

@Module({
  imports: [RoomsModule, CodeRunnerModule],
  controllers: [EvalCollabController],
  providers: [EvalCollabService, EvalCollabWorker, SseCollabService]
})
export class EvalCollabModule {}