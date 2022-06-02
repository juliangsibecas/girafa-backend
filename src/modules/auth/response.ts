import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthSignIn {
  @Field()
  userId: string;

  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}
