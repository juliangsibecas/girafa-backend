import {
  AuthenticationError,
  UserInputError,
  ValidationError,
} from 'apollo-server-express';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

export enum ErrorCodes {
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export const handleError = (err: GraphQLError): GraphQLFormattedError => {
  console.error(err);

  if (err instanceof AuthenticationError) {
    return { message: ErrorCodes.AUTH_ERROR };
  }
  if (err instanceof ValidationError || err instanceof UserInputError) {
    return { message: ErrorCodes.VALIDATION_ERROR };
  }

  return { message: ErrorCodes.UNKNOWN_ERROR };
};
