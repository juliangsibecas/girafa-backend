import { Query, Resolver } from '@nestjs/graphql';

import { ErrorCode, ErrorDescription } from '../../core/graphql';
import { TypesSyncResponse } from './response';

@Resolver()
export class TypesSyncResolver {
  constructor() {}

  @Query(() => TypesSyncResponse)
  async typesSync(): Promise<TypesSyncResponse> {
    return {
      code: ErrorCode.UNKNOWN_ERROR,
      description: ErrorDescription.SIGN_IN_INVALID,
    };
  }
}
