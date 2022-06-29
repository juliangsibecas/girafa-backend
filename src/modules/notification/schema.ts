import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { BaseSchema, Id } from 'src/common/types';
import { v4 } from 'uuid';
import { Party } from '../party';
import { User } from '../user/schema';
import { NotificationType } from './type';

registerEnumType(NotificationType, {
  name: 'NotificationType',
});

@Schema({ timestamps: true })
@ObjectType()
export class Notification extends BaseSchema {
  @Prop({ type: String, default: v4 })
  _id: Id;

  @Prop()
  @Field(() => NotificationType)
  type: NotificationType;

  @Prop({
    ref: User.name,
    type: [String],
  })
  @Field(() => User)
  user: User;

  @Prop({
    ref: User.name,
    type: [String],
  })
  @Field(() => User)
  from: User;

  @Prop({
    ref: Party.name,
    type: [String],
  })
  @Field(() => Party, { nullable: true })
  party?: Party;
}

export type NotificationDocument = Notification & mongoose.Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
