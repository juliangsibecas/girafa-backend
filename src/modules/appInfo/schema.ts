import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { v4 } from 'uuid';

import { Id } from '../../common/types';

@Schema()
@ObjectType()
export class AppInfo {
  @Prop({ type: String, default: v4 })
  @Field(() => String)
  _id: Id;

  @Prop()
  @Field()
  minVersion: string;
}

export type AppInfoDocument = AppInfo & mongoose.Document;
export const AppInfoSchema = SchemaFactory.createForClass(AppInfo);
