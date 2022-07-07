import { Field, ObjectType } from '@nestjs/graphql';
import { DateTimeResolver } from 'graphql-scalars';
import { Id } from './Id';

@ObjectType()
export class BaseSchema {
  @Field(() => String)
  _id: Id;

  @Field(() => DateTimeResolver)
  createdAt: Date;

  @Field(() => DateTimeResolver, { nullable: true })
  updatedAt?: Date;
}
