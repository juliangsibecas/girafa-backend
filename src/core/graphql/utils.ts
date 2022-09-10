import { AuthenticationError } from 'apollo-server-express';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

export enum ErrorCodes {
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
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

  return { message: ErrorCodes.UNKNOWN_ERROR };
};
