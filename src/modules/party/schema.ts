import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DateResolver } from 'graphql-scalars';
import * as mongoose from 'mongoose';
import { BaseSchema, Id } from 'src/common/types';
import { v4 } from 'uuid';
import { User } from '../user/schema';
import { Coordinates } from './coordinates';
import { PartyAvailability } from './types';

registerEnumType(PartyAvailability, {
  name: 'PartyAvailability',
});

@Schema({ timestamps: true })
@ObjectType()
export class Party extends BaseSchema {
  @Prop({ type: String, default: v4 })
  _id: Id;

  @Prop()
  @Field()
  name: string;

  @Prop()
  @Field(() => PartyAvailability)
  availability: PartyAvailability;

  @Prop()
  @Field()
  allowInvites: boolean;

  @Prop()
  @Field()
  address: string;

  @Prop()
  @Field(() => DateResolver)
  date: Date;

  @Prop()
  @Field({ nullable: true })
  minAge?: string;

  @Prop()
  @Field()
  openBar: boolean;

  @Prop()
  @Field()
  description: string;

  @Prop()
  @Field()
  coordinates: Coordinates;

  @Prop({
    type: [
      {
        ref: User.name,
        type: String,
      },
    ],
  })
  @Field(() => [User])
  attenders: Array<User>;

  @Prop({ default: 0 })
  @Field()
  attendersCount: number;

  @Prop({
    ref: User.name,
    type: String,
  })
  @Field(() => User)
  organizer: User;

  @Prop({
    type: [
      {
        ref: User.name,
        type: String,
      },
    ],
  })
  @Field(() => [User])
  invited: Array<User>;
}

export type PartyDocument = Party & mongoose.Document;
export const PartySchema = SchemaFactory.createForClass(Party);
