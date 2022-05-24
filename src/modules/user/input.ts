import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserChangeFollowingStateInput {
  @Field()
  followingId: string;

  @Field()
  state: boolean;
}

@InputType()
export class UserChangeAttendingStateInput {
  @Field()
  partyId: string;

  @Field()
  state: boolean;
}
