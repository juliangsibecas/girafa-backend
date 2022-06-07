import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { BaseSchema } from 'src/common/types';
import { Notification } from '../notification/schema';
import { Party } from '../party/schema';

@Schema({ timestamps: true })
@ObjectType()
export class User extends BaseSchema {
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
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
  })
  @Field(() => [User])
  followers: Array<User>;

  @Prop({
    type: [
      {
        ref: User.name,
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
  })
  @Field(() => [User])
  following: Array<User>;

  @Prop({
    type: [
      {
        ref: 'Party',
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
  })
  @Field(() => [Party])
  organizedParties: Array<Party>;

  @Prop({
    type: [
      {
        ref: 'Party',
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
  })
  @Field(() => [Party])
  attendedParties: Array<Party>;

  @Prop({
    type: [
      {
        ref: 'Party',
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
  })
  @Field(() => [Party])
  invites: Array<Party>;

  @Prop({
    type: [
      {
        ref: 'Notification',
        type: mongoose.Schema.Types.ObjectId,
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
