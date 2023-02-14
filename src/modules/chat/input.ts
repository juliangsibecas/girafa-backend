import { Field, InputType } from '@nestjs/graphql';
import { Id } from 'src/common/types';

@InputType()
export class ChatCreateInput {
  @Field()
  withId: string;
}

@InputType()
export class ChatMessagesGetInput {
  @Field()
  chatId: Id;
}

@InputType()
export class ChatMessageSendInput {
  @Field()
  chatId: Id;

  @Field()
  text: string;
}
