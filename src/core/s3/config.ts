import { registerAs } from '@nestjs/config';

export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  name: string;
}

export const s3Config = registerAs(
  's3',
  (): S3Config => ({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.BUCKET_ENDPOINT,
    name: process.env.BUCKET_NAME,
  }),
);
