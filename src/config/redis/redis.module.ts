import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS } from './redis.constants';
import { RedisService } from './redis.service';

@Global()
@Module({
	providers: [
		{
			provide: REDIS,
			useFactory: () =>
				new Redis<'resp3'>({
					host: process.env.REDIS_HOST,
					port: Number(process.env.REDIS_PORT),
					username: process.env.REDIS_USERNAME,
					password: process.env.REDIS_PASSWORD,
				}),
		},
		RedisService,
	],
	exports: [RedisService],
})
export class RedisModule { }