import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
@ObjectType()
export class Coordinates {
  @Field()
  @Prop()
  latitude: number;

  @Field()
  @Prop()
  longitude: number;
}
