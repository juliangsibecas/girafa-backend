import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GroupedCount {
  @Field()
  _id: string;

  @Field()
  count: number;
}
