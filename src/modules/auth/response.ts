import { Field, ObjectType } from '@nestjs/graphql';

import { Id } from '../../common/types';

@ObjectType()
export class AuthSignIn {
  @Field(() => String)
  userId: Id;

  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}
