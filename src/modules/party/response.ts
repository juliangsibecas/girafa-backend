import { Field, ObjectType, PickType } from '@nestjs/graphql';
import { Party } from './schema';

@ObjectType()
export class PartyPreview extends PickType(Party, ['_id', 'name']) {
  @Field({ nullable: true })
  organizerNickname?: string;
}

@ObjectType()
export class PartyMapPreview extends PickType(Party, [
  '_id',
  'name',
  'coordinates',
  'date',
]) {
  @Field({ nullable: true })
  organizerNickname?: string;
}

@ObjectType()
export class PartyGetByIdResponse extends PickType(Party, [
  '_id',
  'availability',
  'name',
  'organizer',
  'address',
  'date',
  'openBar',
  'description',
  'attenders',
  'attendersCount',
  'allowInvites',
]) {
  @Field()
  isAttender: boolean;
}
