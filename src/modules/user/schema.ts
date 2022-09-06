import { v4 } from 'uuid';
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { BaseSchema, Id } from 'src/common/types';
import { Notification } from '../notification/schema';
import { Party } from '../party/schema';

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

  @Prop({ select: false })
  @Field({ nullable: true })
  password?: string;

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
  followers: Array<User>;

  @Prop({ default: 0 })
  @Field()
  followersCount: number;

  @Prop({
    type: [
      {
        ref: User.name,
        type: String,
      },
    ],
  })
  @Field(() => [User])
  following: Array<User>;

  @Prop({ default: 0 })
  @Field()
  followingCount: number;

  @Prop({
    type: [
      {
        ref: 'Party',
        type: String,
      },
    ],
  })
  @Field(() => [Party])
  attendedParties: Array<Party>;

  @Prop({ default: 0 })
  @Field()
  attendedPartiesCount: number;

  @Prop({
    type: [
      {
        ref: 'Party',
        type: String,
      },
    ],
  })
  @Field(() => [Party])
  invites: Array<Party>;

  @Prop({
    type: [
      {
        ref: 'Notification',
        type: String,
      },
    ],
  })
  @Field(() => [Notification])
  notifications: Array<Notification>;

  //
  // meta
  //

  @Prop({ select: false })
  @Field({ nullable: true })
  recoveryCode?: string;

  @Prop({ select: false })
  @Field({ nullable: true })
  refreshToken?: string;
}

export type UserDocument = User & mongoose.Document;
export const UserSchema = SchemaFactory.createForClass(User);
