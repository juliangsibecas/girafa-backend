import { Field, ObjectType, PickType } from '@nestjs/graphql';
import { User } from './schema';

@ObjectType()
export class UserPreview extends PickType(User, [
  '_id',
  'nickname',
  'pictureId',
]) {
  @Field({ nullable: true })
  fullName?: string;
}

@ObjectType()
export class UserGetResponse extends PickType(User, [
  '_id',
  'nickname',
  'pictureId',
  'bannerId',
  'fullName',
  'instagramUsername',
  'attendedPartiesCount',
]) {
  @Field()
  followingCount: number;

  @Field()
  followersCount: number;

  @Field()
  isFollowing: boolean;

  @Field()
  isFollower: boolean;
}

//
// ADMIN
//

@ObjectType()
export class AdminUserListResponse {
  @Field(() => [UserPreview])
  users: Array<UserPreview>;

  @Field()
  total: number;
}
