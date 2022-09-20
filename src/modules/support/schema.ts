import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { v4 } from 'uuid';

import { BaseSchema, Id } from '../../common/types';

import { User } from '../user';

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'support_messages',
})
@ObjectType()
export class SupportMessage extends BaseSchema {
  @Prop({ type: String, default: v4 })
  _id: Id;

  @Prop({
    ref: User.name,
    type: String,
  })
  @Field(() => User)
  user: User;

  @Prop()
  @Field()
  subject: string;

  @Prop()
  @Field()
  body: string;
}

export type SupportMessageDocument = SupportMessage & mongoose.Document;
export const SupportMessageSchema =
  SchemaFactory.createForClass(SupportMessage);
