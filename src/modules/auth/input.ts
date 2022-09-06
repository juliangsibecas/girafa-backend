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
export class AuthGenerateRecoveryCodeInput {
  @Field()
  email: string;
}

@InputType()
export class AuthRecoverPasswordInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  code: string;
}

@InputType()
export class AuthChangePasswordInput {
  @Field()
  currentPassword: string;

  @Field()
  newPassword: string;
}
