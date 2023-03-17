import { v4 } from 'uuid';
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { ArrayField, BaseSchema, Id } from '../../common/types';

import { Notification } from '../notification/schema';
import { Party } from '../party/schema';
import { Chat } from '../chat/schema';

@Schema({ timestamps: true })
@ObjectType()
export class User extends BaseSchema {
  @Prop({ type: String, default: v4 })
  _id: Id;

  @Prop()
  @Field()
  email: string;

  @Prop()
  @Field()
  nickname: string;

  @Prop()
  @Field()
  fullName: string;

  @Prop()
  @Field({ nullable: true })
  pictureId?: string;

  @Prop()
  @Field({ nullable: true })
  bannerId?: string;

  @Prop({ select: false })
  @Field({ nullable: true })
  password?: string;

  @Prop()
  @Field({ nullable: true })
  instagramUsername?: string;

  @Prop()
  @Field({ nullable: true })
  bio?: string;

  @Prop({
    type: [
      {
        ref: User.name,
        type: String,
      },
    ],
  })
  @Field(() => [User])
  followers: ArrayField<User>;

  @Prop({
    type: [
      {
        ref: User.name,
        type: String,
      },
    ],
  })
  @Field(() => [User])
  following: ArrayField<User>;

  @Prop({
    type: [
      {
        ref: 'Party',
        type: String,
      },
    ],
  })
  @Field(() => [Party])
  attendedParties: ArrayField<Party>;

  @Prop({
    type: [
      {
        ref: 'Party',
        type: String,
      },
    ],
  })
  organizedParties: ArrayField<Party>;

  @Prop({
    type: [
      {
        ref: 'Party',
        type: String,
      },
    ],
  })
  @Field(() => [Party])
  invites: ArrayField<Party>;

  @Prop({
    type: [
      {
        ref: 'Notification',
        type: String,
      },
    ],
  })
  @Field(() => [Notification])
  notifications: ArrayField<Notification>;

  @Prop({
    type: [
      {
        ref: 'Chat',
        type: String,
      },
    ],
    default: [],
  })
  @Field(() => [Chat])
  chats: ArrayField<Chat>;

  //
  // meta
  //

  @Prop({ select: false })
  @Field({ nullable: true })
  recoveryCode?: string;

  @Prop({ select: false })
  @Field({ nullable: true })
  refreshToken?: string;

  @Prop({ select: false })
  @Field({ nullable: true })
  isOpera?: boolean;
}

export type UserDocument = User & mongoose.Document;
export const UserSchema = SchemaFactory.createForClass(User);
