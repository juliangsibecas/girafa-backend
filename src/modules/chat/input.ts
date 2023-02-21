import { Field, InputType } from '@nestjs/graphql';
import { Id } from 'src/common/types';

@InputType()
export class ChatUserGetInput {
  @Field()
  id: string;
}

@InputType()
export class ChatMessagesGetInput {
  @Field()
  chatId: Id;
}

@InputType()
export class ChatCreateInput {
  @Field()
  withId: string;

  @Field()
  messageText: string;
}

@InputType()
export class ChatMessageSendInput {
  @Field()
  chatId: Id;

  @Field()
  text: string;
}

@InputType()
export class ChatMessageSentInput {
  @Field()
  token: string;
}
