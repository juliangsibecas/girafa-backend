import mongoose from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BaseSchema } from '../../../common/types';

import { User } from '../../user';
import { ChatMessage } from './ChatMessage';

@Schema({ timestamps: { createdAt: true } })
@ObjectType()
export class Chat extends BaseSchema {
  @Prop({
    type: [
      {
        ref: 'User',
        type: String,
      },
    ],
  })
  @Field(() => [User])
  users?: Array<User>;

  @Prop(() => [ChatMessage])
  @Field(() => [ChatMessage])
  messages: Array<ChatMessage>;
}

export type ChatDocument = Chat & mongoose.Document;
export const ChatSchema = SchemaFactory.createForClass(Chat);
