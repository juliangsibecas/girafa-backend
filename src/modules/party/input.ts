import { Field, InputType } from '@nestjs/graphql';
import { DateResolver } from 'graphql-scalars';
import { PartyAvailability } from './types';

@InputType()
export class PartyCreateInput {
  @Field()
  name: string;

  @Field(() => PartyAvailability)
  availability: PartyAvailability;

  @Field(() => DateResolver)
  date: Date;

  @Field()
  address: string;

  @Field()
  openBar: boolean;

  @Field()
  description: string;
}
