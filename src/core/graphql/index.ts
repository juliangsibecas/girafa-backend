import { join } from 'path';
import { ApolloDriver } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { appConfig } from '../../app/config';
import { Environment } from '../../common/types';

import { handleError } from './utils';

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
    context: ({ req, res, connectionParams }) => ({
      req,
      res,
      connectionParams,
    }),
    cors: {
      origin: config.get('app.backofficeUrl'),
      credentials: true,
    },
    subscriptions: {
      'graphql-ws': {
        path: '/subscriptions',
      },
    },
  }),
};

export * from './errors';
export * from './utils';
export * from './types';
