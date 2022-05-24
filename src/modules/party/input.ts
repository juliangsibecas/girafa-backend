import { Field, InputType } from '@nestjs/graphql';
import { DateResolver } from 'graphql-scalars';

@InputType()
export class PartyCreateInput {
  @Field()
  name: string;

  @Field(() => DateResolver)
  date: Date;

  @Field()
  address: string;

  @Field()
  openBar: boolean;

  @Field()
  description: string;
}
