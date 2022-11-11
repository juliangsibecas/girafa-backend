import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { v4 } from 'uuid';

import { BaseSchema, Id } from '../../common/types';

import { User } from '../user/schema';
import { Party } from '../party';

import { NotificationType } from './types';

registerEnumType(NotificationType, {
  name: 'NotificationType',
});

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
@ObjectType()
export class Notification extends BaseSchema {
  @Prop({ type: String, default: v4 })
  _id: Id;

  @Prop()
  @Field(() => NotificationType)
  type: NotificationType;

  @Prop({
    ref: 'User',
    type: String,
  })
  @Field(() => User)
  user: User;

  @Prop({
    ref: 'User',
    type: String,
  })
  @Field(() => User)
  from: User;

  @Prop({
    ref: 'Party',
    type: String,
  })
  @Field(() => Party, { nullable: true })
  party?: Party;
}

export type NotificationDocument = Notification & mongoose.Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
