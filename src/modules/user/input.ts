import { Field, InputType } from '@nestjs/graphql';
import { Id } from 'src/common/types';

@InputType()
export class UserSearchFollowersToInviteInput {
  @Field(() => String)
  partyId: Id;

  @Field(() => String, { nullable: true })
  q?: string;
}

@InputType()
export class UserChangeFollowingStateInput {
  @Field(() => String)
  followingId: Id;

  @Field()
  state: boolean;
}

@InputType()
export class UserChangeAttendingStateInput {
  @Field(() => String)
  partyId: Id;

  @Field()
  state: boolean;
}

@InputType()
export class UserSendPartyInviteInput {
  @Field(() => String)
  partyId: Id;

  @Field(() => [String])
  invitedId: Array<Id>;
}

@InputType()
export class UserEditInput {
  @Field()
  fullName: string;

  @Field()
  nickname: string;
}
