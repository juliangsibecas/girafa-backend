import { Field, ObjectType } from '@nestjs/graphql';
import { Id } from 'src/common/types';

@ObjectType()
export class UserPreview {
  @Field(() => String)
  _id: Id;

  @Field()
  nickname: string;

  @Field()
  fullName: string;
}

@ObjectType()
export class UserGetByIdResponse {
  @Field()
  _id: string;

  @Field()
  nickname: string;

  @Field()
  fullName: string;

  @Field()
  followersCount: number;

  @Field()
  followingCount: number;

  @Field()
  attendedPartiesCount: number;

  @Field()
  isFollowing: boolean;
}
