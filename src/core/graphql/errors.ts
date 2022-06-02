import { GraphQLError } from 'graphql';
import { ErrorCodes } from './utils';

export class ValidationError extends GraphQLError {
  constructor(errors: Record<string, string>) {
    super(ErrorCodes.VALIDATION_ERROR, { extensions: { errors } });
  }
}
