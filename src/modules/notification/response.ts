import { Field, ObjectType, PickType } from '@nestjs/graphql';
import { Notification } from './schema';
import { UserPreview } from '../user/response';
import { PartyPreview } from '../party';

@ObjectType()
export class UserNotification extends PickType(Notification, [
  '_id',
  'type',
  'createdAt',
]) {
  @Field(() => UserPreview)
  from: UserPreview;

  @Field(() => PartyPreview, { nullable: true })
  party?: PartyPreview;
}
