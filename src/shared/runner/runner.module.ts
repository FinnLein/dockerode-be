import { Module } from '@nestjs/common';
import { GoRunner } from './go';
import { NodeRunner } from './node';
import { PythonRunner } from './python';
import { RegistryRunner } from './registry.runner';

@Module({
  providers: [RegistryRunner, NodeRunner, GoRunner, PythonRunner],
  exports: [RegistryRunner],
})
export class RunnerModule { }
