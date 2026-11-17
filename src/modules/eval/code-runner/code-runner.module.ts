import { Module } from '@nestjs/common';
import { RunnerModule } from '@shared/runner/runner.module';
import { DockerSandboxModule } from '../sandbox/docker-sandbox.module';
import { CodeRunnerService } from './code-runner.service';

@Module({
  imports: [DockerSandboxModule, RunnerModule],
  providers: [CodeRunnerService],
  exports: [CodeRunnerService]
})
export class CodeRunnerModule { } 