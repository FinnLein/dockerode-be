import { Module } from '@nestjs/common';
import { RunnerModule } from '@shared/runner/runner.module';
import { EvalController } from './eval.controller';
import { EvalService } from './eval.service';
import { EvalWorker } from './eval.worker';
import { SseService } from './sse.service';

@Module({
  imports: [RunnerModule],
  controllers: [EvalController],
  providers: [EvalService, EvalWorker, SseService],
  exports: [EvalService],
})
export class EvalModule {}
