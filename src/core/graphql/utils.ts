import * as request from 'supertest';
import { Server } from 'https';
import { AuthenticationError } from 'apollo-server-express';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { ErrorCode, Operation, Response } from './types';

export const handleError = (err: GraphQLError): GraphQLFormattedError => {
  if (err instanceof AuthenticationError) {
    return { message: ErrorCode.AUTH_ERROR };
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
