import { join } from 'path';
import { ApolloDriver } from '@nestjs/apollo';
import { handleError } from './utils';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { appConfig } from 'src/app';
import { Environment } from 'src/common/types';

export const gqlModuleOptions = {
  imports: [ConfigModule.forFeature(appConfig)],
  inject: [ConfigService],
  driver: ApolloDriver,
  useFactory: (config: ConfigService) => ({
    autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    sortSchema: true,
    playground: config.get('app.env') === Environment.DEVELOPMENT,
    debug: false,
    formatError: handleError,
    context: ({ req, res }) => ({ req, res }),
  }),
};

export * from './errors';
export * from './utils';
export * from './types';
