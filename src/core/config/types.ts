import { IsEnum, IsNotEmpty } from 'class-validator';

import { Environment } from '../../common/types';

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsNotEmpty()
  NODE_ENV: Environment;

  @IsNotEmpty()
  PORT: number;

  @IsNotEmpty()
  ADMIN_EMAIL: string;

  @IsNotEmpty()
  DB_HOST: string;
  @IsNotEmpty()
  DB_NAME: string;
  @IsNotEmpty()
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;

  @IsNotEmpty()
  JWT_ACCESS_TOKEN_SECRET: string;
  @IsNotEmpty()
  JWT_REFRESH_TOKEN_SECRET: string;
  @IsNotEmpty()
  SALT_ROUNDS: number;

  @IsNotEmpty()
  AWS_ACCESS_KEY_ID: string;
  @IsNotEmpty()
  AWS_SECRET_ACCESS_KEY: string;

  @IsNotEmpty()
  BUCKET_ENDPOINT: string;
  @IsNotEmpty()
  BUCKET_NAME: string;

  MAILER_SERVICE: string;
  MAILER_HOST: string;
  MAILER_PORT: string;
  @IsNotEmpty()
  MAILER_USER: string;
  @IsNotEmpty()
  MAILER_PASSWORD: string;

  @IsNotEmpty()
  TELEGRAM_KEY: string;
  @IsNotEmpty()
  TELEGRAM_LOGS_CHANNEL_ID: string;
  @IsNotEmpty()
  TELEGRAM_ANALYTICS_CHANNEL_ID: string;

  @IsNotEmpty()
  ONESIGNAL_API_KEY: string;
  @IsNotEmpty()
  ONESIGNAL_APP_ID: string;

  @IsNotEmpty()
  BACKOFFICE_URL: string;
}

export type RawEnvironmentVariables = Record<
  keyof EnvironmentVariables,
  string
>;
