import { S3Client } from '@aws-sdk/client-s3';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3BucketService } from './s3-bucket.service';
import { S3_CLIENT, S3_CONFIG } from './s3-constants';
import { S3Service } from './s3.service';
import { S3Config } from './s3.types';

@Global()
@Module({
  providers: [
    {
      provide: S3_CONFIG,
      useFactory: (config: ConfigService): S3Config => {
        const endpoint = config.getOrThrow<string>('S3_ENDPOINT');
        const accessKeyId = config.getOrThrow<string>('S3_ACCESS_KEY');
        const secretAccessKey = config.getOrThrow<string>('S3_SECRET_KEY');
        const bucket = config.getOrThrow<string>('S3_BUCKET');

        const region = config.get<string>('S3_REGION', 'us-east-1');
        const publicUrl = config.get<string>('S3_PUBLIC_URL', endpoint);
        const credentials = { accessKeyId, secretAccessKey };

        return {
          endpoint,
          bucket,
          region,
          credentials,
          publicUrl,
        };
      },
      inject: [ConfigService],
    },
    {
      provide: S3_CLIENT,
      useFactory: (config: S3Config) => {
        const { endpoint, region, credentials } = config;

        return new S3Client({
          endpoint,
          region,
          credentials,
          forcePathStyle: true,
        });
      },
      inject: [S3_CONFIG],
    },
    S3BucketService,
    S3Service,
  ],
  exports: [S3Service],
})
export class S3Module {}
