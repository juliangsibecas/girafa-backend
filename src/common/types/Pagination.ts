import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class Pagination {
  @Field()
  limit: number;

  @Field()
  offset: number;
}
