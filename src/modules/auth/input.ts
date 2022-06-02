import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AuthSignUpInput {
  @Field()
  fullName: string;

  @Field()
  nickname: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class AuthSignInInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class AuthCheckRecoveryCodeInput {
  @Field()
  email: string;

  @Field()
  code: string;
}
