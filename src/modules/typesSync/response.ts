import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ErrorCode, ErrorDescription } from '../../core/graphql';

registerEnumType(ErrorCode, {
  name: 'ErrorCode',
});

registerEnumType(ErrorDescription, {
  name: 'ErrorDescription',
});

@ObjectType()
export class TypesSyncResponse {
  @Field(() => ErrorCode)
  code?: string;

  @Field(() => ErrorDescription)
  description?: string;
}
