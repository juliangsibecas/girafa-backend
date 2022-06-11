import { Field, InputType } from '@nestjs/graphql';
import { DateResolver } from 'graphql-scalars';
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
  coordinate: Coordinates;

  @Field()
  address: string;

  @Field()
  @Field()
  openBar: boolean;

  @Field()
  description: string;
}
