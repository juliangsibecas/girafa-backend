import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DateResolver } from 'graphql-scalars';
import * as mongoose from 'mongoose';
import { v4 } from 'uuid';

import { ArrayField, BaseSchema, Id, Maybe } from '../../common/types';

import { User } from '../user/schema';

import { Coordinate } from './coordinate';
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

  @Prop({
    ref: 'User',
    type: String,
  })
  @Field(() => User, { nullable: true })
  organizer: Maybe<User>;

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
  @Field()
  openBar: boolean;

  @Prop()
  @Field()
  description: string;

  @Prop()
  @Field()
  coordinate: Coordinate;

  @Prop({
    type: [
      {
        ref: 'User',
        type: String,
      },
    ],
  })
  @Field(() => [User])
  attenders: ArrayField<User>;

  @Prop({ default: 0 })
  @Field()
  attendersCount: number;

  @Prop({
    type: [
      {
        ref: 'User',
        type: String,
      },
    ],
  })
  @Field(() => [User])
  invited: ArrayField<User>;

  @Prop({ default: false })
  @Field()
  isExpired: boolean;

  @Prop({ default: false })
  @Field()
  isEnabled: boolean;
}

export type PartyDocument = Party & mongoose.Document;
export const PartySchema = SchemaFactory.createForClass(Party);
