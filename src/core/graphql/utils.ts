import * as request from 'supertest';
import { Server } from 'https';
import { AuthenticationError } from 'apollo-server-express';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

interface Operation {
  variables: any;
  query: string;
}

interface Response<T> {
  data?: T;
  errors?: Array<{ message: ErrorCodes }>;
}

export enum ErrorCodes {
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  FORBIDDEN_ERROR = 'FORBIDEN_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export const handleError = (err: GraphQLError): GraphQLFormattedError => {
  if (err instanceof AuthenticationError) {
    return { message: ErrorCodes.AUTH_ERROR };
  }

  if (err instanceof GraphQLError) {
    return {
      message: err.message,
      extensions: err.extensions as Record<string, string>,
    };
  }

  return err;
};

export async function gql<T>(
  server: Server,
  operation: Operation,
  accessToken?: string,
): Promise<Response<T>> {
  const res = await request(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(operation);

  return res.body;
}
