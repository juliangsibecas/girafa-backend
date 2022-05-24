import { Field, InputType } from '@nestjs/graphql';
import { DateResolver } from 'graphql-scalars';

@InputType()
export class AuthSignUpInput {
  @Field()
  email: string;

  @Field()
  nickname: string;

  @Field()
  password: string;

  @Field()
  fullName: string;

  @Field(() => DateResolver)
  birthdate: Date;
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
