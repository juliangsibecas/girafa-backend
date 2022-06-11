import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CoordinatesCreateInput {
  @Field()
  latitude: number;

  @Field()
  longitude: number;
}
