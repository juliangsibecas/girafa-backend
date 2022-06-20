import { Field, ObjectType } from '@nestjs/graphql';
import { DateResolver } from 'graphql-scalars';
import { User } from '../user';
import { PartyAvailability } from './types';

@ObjectType()
export class PartyGetByIdResponse {
  @Field()
  _id: string;

  @Field(() => PartyAvailability)
  availability: PartyAvailability;
  @Field()
  name: string;

  @Field(() => User)
  organizer: User;

  @Field()
  address: string;

  @Field(() => DateResolver)
  date: Date;

  @Field()
  openBar: boolean;

  @Field()
  description: string;

  @Field(() => [User])
  attenders: Array<User>;

  @Field()
  attendersCount: number;

  @Field()
  allowInvites: boolean;

  @Field()
  isAttender: boolean;
}
