interface S3Credentials {
  accessKeyId: string;
  secretAccessKey: string;
}

interface S3Config {
  endpoint: string;
  publicUrl: string | null;
  region: string;
  bucket: string;
  credentials: S3Credentials;
}

export type { S3Config, S3Credentials };
