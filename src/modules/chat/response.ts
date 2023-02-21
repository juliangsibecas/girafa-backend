import { Field, ObjectType, PickType } from '@nestjs/graphql';

import { Id } from '../../common/types';

import { UserPreview } from '../user';
import { Chat, ChatMessage } from './schema';

@ObjectType()
export class ChatPreview extends PickType(Chat, ['_id']) {
  @Field(() => UserPreview)
  user: UserPreview;

  @Field(() => ChatMessage)
  lastMessage: ChatMessage;
}

@ObjectType()
export class ChatNewMessageResponse extends ChatMessage {
  @Field()
  chatId: Id;
}
