import { Module } from '@nestjs/common';
import { CodeRunnerModule } from './code-runner/code-runner.module';
import { EvalCollabModule } from './collab/eval-collab.module';
import { EvalController } from './eval.controller';
import { EvalService } from './eval.service';
import { EvalWorker } from './eval.worker';
import { SseService } from './sse.service';

@Module({
  imports: [CodeRunnerModule, EvalCollabModule],
  controllers: [EvalController],
  providers: [
    EvalService,
    EvalWorker,
    SseService,
  ],
  exports: [EvalService],
})
export class EvalModule { }
