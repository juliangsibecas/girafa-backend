import { GraphQLError } from 'graphql';
import { ErrorCode } from './types';

export class ValidationError extends GraphQLError {
  constructor(errors: Record<string, string>) {
    super(ErrorCode.VALIDATION_ERROR, { extensions: errors });
  }
}

export class UnknownError extends GraphQLError {
  constructor() {
    super(ErrorCode.UNKNOWN_ERROR, {});
  }
}

export class NotFoundError extends GraphQLError {
  constructor() {
    super(ErrorCode.NOT_FOUND_ERROR, {});
  }
}

export class ForbiddenError extends GraphQLError {
  constructor() {
    super(ErrorCode.FORBIDDEN_ERROR, {});
  }
}

export class FeatureToggleError extends GraphQLError {
  constructor() {
    super(ErrorCode.FEATURE_TOGGLE_ERROR, {});
  }
}
