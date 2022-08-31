import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CoordinateCreateInput {
  @Field()
  latitude: number;

  @Field()
  longitude: number;
}
