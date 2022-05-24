import { Field, InputType } from '@nestjs/graphql';
import { DateResolver } from 'graphql-scalars';

@InputType()
export class UserCreateInput {
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
export class UserChangeFollowingStateInput {
  @Field()
  followingId: string;

  @Field()
  state: boolean;
}
