import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { publicReadPolicy } from './policies/publicReadPolicy';
import { S3_CLIENT, S3_CONFIG } from './s3-constants';
import type { S3Config } from './s3.types';

@Injectable()
export class S3BucketService implements OnModuleInit {
  private readonly logger = new Logger(S3BucketService.name);

  constructor(
    @Inject(S3_CLIENT) private readonly client: S3Client,
    @Inject(S3_CONFIG) private readonly config: S3Config,
  ) {}

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      await this.client.send(
        new HeadBucketCommand({ Bucket: this.config.bucket }),
      );
      this.logger.log(`Бакет "${this.config.bucket}" уже существует`);
    } catch {
      this.logger.log(`Бакет "${this.config.bucket}" не найден. Создаю...`);

      await this.client.send(
        new CreateBucketCommand({ Bucket: this.config.bucket }),
      );

      const policy = publicReadPolicy(this.config.bucket);

      await this.client.send(
        new PutBucketPolicyCommand({
          Bucket: this.config.bucket,
          Policy: JSON.stringify(policy),
        }),
      );

      this.logger.log(
        `Бакет "${this.config.bucket}" успешно создан с правами Public Read`,
      );
    }
  }
}
