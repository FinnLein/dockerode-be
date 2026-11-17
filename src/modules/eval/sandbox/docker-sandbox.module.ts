import { Module } from '@nestjs/common';
import { DockerSandboxService } from './docker-sandbox.service';

@Module({
  providers: [DockerSandboxService],
  exports: [DockerSandboxService]
})
export class DockerSandboxModule { }