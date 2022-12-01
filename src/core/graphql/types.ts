export enum ErrorCodes {
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  FORBIDDEN_ERROR = 'FORBIDEN_ERROR',
  FEATURE_TOGGLE_ERROR = 'FEATURE_TOGGLE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface Operation {
  variables: any;
  query: string;
}

export interface Response<T> {
  data?: T;
  errors?: Array<{ message: ErrorCodes }>;
}
