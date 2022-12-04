import { Field, ObjectType, PickType } from '@nestjs/graphql';
import { User } from './schema';

@ObjectType()
export class UserPreview extends PickType(User, ['_id', 'nickname']) {
  @Field({ nullable: true })
  fullName?: string;
}

@ObjectType()
export class UserGetByIdResponse extends PickType(User, [
  '_id',
  'nickname',
  'fullName',
  'followersCount',
  'followingCount',
  'attendedPartiesCount',
]) {
  @Field()
  isFollowing: boolean;
  @Field()
  isFollower: boolean;
}
