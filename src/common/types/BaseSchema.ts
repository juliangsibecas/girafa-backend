import { Field, ObjectType } from '@nestjs/graphql';
import { DateResolver } from 'graphql-scalars';
import { Id } from './Id';

@ObjectType()
export class BaseSchema {
  @Field(() => String)
  _id: Id;

  @Field(() => DateResolver)
  createdAt: Date;

  @Field(() => DateResolver)
  updatedAt: Date;
}
