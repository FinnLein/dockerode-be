import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { S3_CLIENT, S3_CONFIG } from './s3-constants';
import type { S3Config } from './s3.types';

@Injectable()
export class S3Service {
  constructor(
    @Inject(S3_CLIENT) private readonly client: S3Client,
    @Inject(S3_CONFIG) private readonly config: S3Config,
  ) {}

  getPublicUrl(key: string) {
    return `${this.config.publicUrl}/${this.config.bucket}/${key}`;
  }

  async uploadBuffer(buffer: Buffer, key: string, contentType: string) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return key;
  }
}
