import mongoose from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ArrayField, BaseSchema } from '../../../common/types';

import { User } from '../../user';

@Schema({ timestamps: { createdAt: true } })
@ObjectType()
export class ChatGroup extends BaseSchema {
  @Prop()
  @Field()
  name: string;

  @Prop({
    type: [
      {
        ref: 'User',
        type: String,
      },
    ],
  })
  @Field(() => [User])
  user: ArrayField<User>;
}

export type ChatGroupDocument = ChatGroup & mongoose.Document;
export const ChatGroupSchema = SchemaFactory.createForClass(ChatGroup);
