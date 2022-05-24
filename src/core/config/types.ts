import { IsEnum, IsNotEmpty } from 'class-validator';

import { Environment } from '../../common/types';

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsNotEmpty()
  NODE_ENV: Environment;

  @IsNotEmpty()
  PORT: number;

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
  AWS_S3_ENDPOINT: string;

  @IsNotEmpty()
  MAILER_HOST: string;

  @IsNotEmpty()
  MAILER_PORT: string;

  @IsNotEmpty()
  MAILER_USER: string;

  @IsNotEmpty()
  MAILER_PASSWORD: string;
}

export type RawEnvironmentVariables = Record<
  keyof EnvironmentVariables,
  string
>;
