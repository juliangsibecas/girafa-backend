import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
@ObjectType()
export class Coordinate {
  @Field()
  @Prop()
  latitude: number;

  @Field()
  @Prop()
  longitude: number;
}
