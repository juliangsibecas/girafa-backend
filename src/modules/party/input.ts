import { Field, InputType } from '@nestjs/graphql';
import { DateResolver } from 'graphql-scalars';
import { Id } from 'src/common/types';
import { Coordinates, CoordinatesCreateInput } from './coordinates';
import { PartyAvailability } from './types';

@InputType()
export class PartyCreateInput {
  @Field()
  name: string;

  @Field(() => PartyAvailability)
  availability: PartyAvailability;

  @Field(() => DateResolver)
  date: Date;

  @Field(() => CoordinatesCreateInput)
  coordinates: Coordinates;

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
export class PartySearchAttendersInput {
  @Field(() => String)
  id: Id;

  @Field({ nullable: true })
  q?: string;
}
