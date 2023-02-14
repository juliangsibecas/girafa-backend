import mongoose from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BaseSchema, Id } from '../../../common/types';
import { DateTimeResolver } from 'graphql-scalars';

@Schema({ timestamps: { createdAt: true } })
@ObjectType()
export class ChatMessage extends BaseSchema {
  @Prop()
  @Field()
  fromId: Id;

  @Prop()
  @Field()
  text: string;

  @Prop(() => Date)
  @Field(() => DateTimeResolver)
  createdAt: Date;
}

export type ChatMessageDocument = ChatMessage & mongoose.Document;
export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
