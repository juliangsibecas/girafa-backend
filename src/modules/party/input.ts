import { Field, InputType } from '@nestjs/graphql';
import { DateResolver } from 'graphql-scalars';

import { Id } from '../../common/types';

import { Coordinate, CoordinateCreateInput } from './coordinate';
import { PartyAvailability } from './types';

@InputType()
export class PartyCreateInput {
  @Field()
  name: string;

  @Field(() => PartyAvailability)
  availability: PartyAvailability;

  @Field(() => DateResolver)
  date: Date;

  @Field(() => CoordinateCreateInput)
  coordinate: Coordinate;

  @Field()
  address: string;

  @Field()
  openBar: boolean;

  @Field()
  description: string;

  @Field()
  allowInvites: boolean;
}

@InputType()
export class PartyGetInput {
  @Field(() => String, { nullable: true })
  id?: Id;

  @Field({ nullable: true })
  slug?: string;
}

@InputType()
export class PartySearchAttendersInput {
  @Field(() => String)
  id: Id;

  @Field({ nullable: true })
  q?: string;
}

@InputType()
export class AdminPartyCreateFromInput {
  @Field(() => String)
  id: Id;

  @Field(() => DateResolver)
  date: Date;
}
