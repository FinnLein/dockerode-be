import { Module } from '@nestjs/common';
import { GoRunner } from '@shared/runner/go/go.runner';
import { RegistryRunner } from '@shared/runner/registry.runner';
import { EvalController } from './eval.controller';
import { EvalService } from './eval.service';
import { EvalWorker } from './eval.worker';
import { SseService } from './sse.service';

@Module({
  controllers: [EvalController],
  providers: [EvalService, EvalWorker, SseService, RegistryRunner, GoRunner],
  exports: [EvalService],
})
export class EvalModule { }
