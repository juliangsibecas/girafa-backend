import { join } from 'path';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { handleError } from '../../common/utils/error';

export const gqlModuleOptions: GraphQLModule['options'] = {
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  sortSchema: true,
  playground: true,
  debug: false,
  formatError: handleError,
  context: ({ req, res }) => ({ req, res }),
};
