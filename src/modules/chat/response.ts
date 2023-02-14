import { Field, ObjectType, PickType } from '@nestjs/graphql';
import { UserPreview } from '../user';
import { Chat, ChatMessage } from './schema';

@ObjectType()
export class ChatPreview extends PickType(Chat, ['_id']) {
  @Field(() => UserPreview)
  user: UserPreview;

  @Field(() => ChatMessage)
  lastMessage: ChatMessage;
}
