import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Redis } from 'ioredis';
import { completeScript } from './scripts/complete.lua';
import { releaseScript } from './scripts/release.lua';
import { REDIS } from './redis.constants';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async onModuleDestroy() {
    await this.redis.quit();
  }

  async acquire(key: string, ttlSec: number): Promise<string | null> {
    const token = randomUUID();
    const ok = await this.redis.set(key, token, 'EX', ttlSec, 'NX');
    return ok ? token : null;
  }

  async release(key: string, token: string): Promise<void> {
    await this.redis.eval(releaseScript, 1, key, token);
  }

  async complete(
    key: string,
    token: string,
    doneTtlSec: number,
  ): Promise<boolean> {
    const res = await this.redis.eval(
      completeScript,
      1,
      key,
      token,
      doneTtlSec,
    );
    return res !== 0;
  }

  async getJobStatus(key: string): Promise<'done' | 'processing' | null> {
    const v = await this.redis.get(key);
    return v === null ? null : v === 'done' ? 'done' : 'processing';
  }
}
