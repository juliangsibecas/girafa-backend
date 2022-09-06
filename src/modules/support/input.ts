import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SupportSendMessageInput {
  @Field()
  subject: string;

  @Field()
  body: string;
}
