import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { BaseSchema } from 'src/common/types';
import { Party } from '../party';
import { User } from '../user/schema';
import { NotificationType } from './type';

registerEnumType(NotificationType, {
  name: 'NotificationType',
});

@Schema({ timestamps: true })
@ObjectType()
export class Notification extends BaseSchema {
  @Prop()
  @Field(() => NotificationType)
  type: NotificationType;

  @Prop({
    ref: User.name,
    type: [mongoose.Schema.Types.ObjectId],
  })
  @Field(() => User)
  user: User;

  @Prop({
    ref: User.name,
    type: [mongoose.Schema.Types.ObjectId],
  })
  @Field(() => User)
  from: User;

  @Prop({
    ref: Party.name,
    type: [mongoose.Schema.Types.ObjectId],
  })
  @Field(() => Party, { nullable: true })
  party?: Party;
}

export type NotificationDocument = Notification & mongoose.Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
