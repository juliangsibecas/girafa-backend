import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { v4 } from 'uuid';

import { Id } from '../../common/types';
import { FeatureToggleName } from './types';

registerEnumType(FeatureToggleName, {
  name: 'FeatureToggleName',
});

@Schema()
@ObjectType()
export class FeatureToggle {
  @Prop({ type: String, default: v4 })
  @Field(() => String)
  _id: Id;

  @Prop({ unique: true })
  @Field(() => FeatureToggleName)
  name: FeatureToggleName;

  @Prop({ type: Boolean, default: false })
  @Field()
  value: boolean;
}

export type FeatureToggleDocument = FeatureToggle & mongoose.Document;
export const FeatureToggleSchema = SchemaFactory.createForClass(FeatureToggle);
