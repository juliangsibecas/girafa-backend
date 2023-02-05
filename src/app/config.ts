import { registerAs } from '@nestjs/config';

import { Environment } from '../common/types';

export interface AppConfig {
  env: Environment;
  port: number;
  adminEmail: string;
  backofficeUrl: string;
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    env: process.env.NODE_ENV as Environment,
    port: parseInt(process.env.PORT),
    adminEmail: process.env.ADMIN_EMAIL,
    backofficeUrl: process.env.BACKOFFICE_URL,
  }),
);
