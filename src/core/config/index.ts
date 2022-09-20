import { ConfigModuleOptions } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

import { appConfig } from '../../app/config';
import { authConfig } from '../../modules/auth';
import { jwtConfig } from '../jwt';
import { mailerConfig } from '../mailer';
import { dbConfig } from '../mongoose';
import { onesignalConfig } from '../onesignal';
import { s3Config } from '../s3';
import { telegramConfig } from '../telegram';

import { EnvironmentVariables } from './types';

const validate = (config: Record<string, unknown>) => {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
};

export const configModuleOptions: ConfigModuleOptions = {
  envFilePath: `.env.${process.env.NODE_ENV}`,
  load: [
    appConfig,
    dbConfig,
    s3Config,
    authConfig,
    jwtConfig,
    mailerConfig,
    telegramConfig,
    onesignalConfig,
  ],
  validate: validate,
};
