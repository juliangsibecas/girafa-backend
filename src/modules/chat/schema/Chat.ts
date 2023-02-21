import mongoose from 'mongoose';
import { v4 } from 'uuid';
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ArrayField, BaseSchema, Id } from '../../../common/types';

import { User } from '../../user';

import { ChatMessage, ChatMessageSchema } from './ChatMessage';

@Schema({ timestamps: { createdAt: true } })
@ObjectType()
export class Chat extends BaseSchema {
  @Prop({ type: String, default: v4 })
  _id: Id;

  @Prop({
    type: [
      {
        ref: 'User',
        type: String,
      },
    ],
  })
  @Field(() => [User])
  users?: ArrayField<User>;

  @Prop(() => [ChatMessageSchema])
  @Field(() => [ChatMessage])
  messages: Array<ChatMessage>;
}

export type ChatDocument = Chat & mongoose.Document;
export const ChatSchema = SchemaFactory.createForClass(Chat);
