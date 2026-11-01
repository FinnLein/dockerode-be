import { Module } from '@nestjs/common';
import { GoRunner } from './go';
import { NodeRunner } from './node';
import { RegistryRunner } from './registry.runner';

@Module({
	providers: [RegistryRunner, NodeRunner, GoRunner],
	exports: [RegistryRunner, NodeRunner, GoRunner]
})
export class RunnerModule { }