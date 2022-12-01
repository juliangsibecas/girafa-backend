import { GraphQLError } from 'graphql';
import { ErrorCodes } from './types';

export class ValidationError extends GraphQLError {
  constructor(errors: Record<string, string>) {
    super(ErrorCodes.VALIDATION_ERROR, { extensions: errors });
  }
}

export class UnknownError extends GraphQLError {
  constructor() {
    super(ErrorCodes.UNKNOWN_ERROR, {});
  }
}

export class NotFoundError extends GraphQLError {
  constructor() {
    super(ErrorCodes.NOT_FOUND_ERROR, {});
  }
}

export class ForbiddenError extends GraphQLError {
  constructor() {
    super(ErrorCodes.FORBIDDEN_ERROR, {});
  }
}

export class FeatureToggleError extends GraphQLError {
  constructor() {
    super(ErrorCodes.FEATURE_TOGGLE_ERROR, {});
  }
}
