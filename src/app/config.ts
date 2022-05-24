import { registerAs } from '@nestjs/config';
import { Environment } from '../common/types';

export interface AppConfig {
  env: Environment;
  port: number;
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    env: process.env.NODE_ENV as Environment,
    port: parseInt(process.env.PORT),
  }),
);
