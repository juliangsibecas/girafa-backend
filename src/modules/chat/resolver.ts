import { forwardRef, Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Id } from 'src/common/types';

import { CurrentUser } from '../auth/graphql';
import { UserService } from '../user';
import { UserDocument } from '../user/schema';
import {
  ChatCreateInput,
  ChatMessageSendInput,
  ChatMessagesGetInput,
} from './input';
import { ChatPreview } from './response';

import { Chat, ChatMessage } from './schema';
import { ChatService } from './service';

@Resolver(() => Chat)
export class ChatResolver {
  constructor(
    private chats: ChatService,
    @Inject(forwardRef(() => UserService)) private users: UserService,
  ) {}

  @Query(() => [ChatPreview])
  async chatGet(
    @CurrentUser() user: UserDocument,
  ): Promise<Array<ChatPreview>> {
    try {
      user = await user.populate({
        path: 'chats',
        populate: [
          {
            path: 'users',
            select: ['nickname', 'pictureId'],
          },
        ],
      });

      return ((user.chats as Array<Chat>) ?? []).map((chat) => ({
        _id: chat._id,
        user: chat.users.find((otherUser) => otherUser._id !== user._id)!,
        lastMessage: chat.messages.pop(),
      }));
    } catch (e) {
      console.log(e);
    }
  }

  @Query(() => [ChatMessage])
  async chatMessagesGet(
    @CurrentUser() user: UserDocument,
    @Args('data') { chatId }: ChatMessagesGetInput,
  ): Promise<Array<ChatMessage>> {
    try {
      if (!(user.chats as Array<Id>).includes(chatId)) {
        throw new Error();
      }

      return this.chats.getMessages(chatId);
    } catch (e) {}
  }

  @Mutation(() => Chat)
  async chatCreate(
    @CurrentUser() user: UserDocument,
    @Args('data') data: ChatCreateInput,
  ): Promise<Chat> {
    try {
      await user.populate({
        path: 'chats',
        populate: {
          path: 'users',
          select: ['nickname', 'pictureId'],
        },
      });

      let chat = (user.chats as Array<Chat>).find(
        ({ users }) =>
          users.length === 2 &&
          users.filter(({ _id }) => [user._id, data.withId].includes(_id)),
      );

      if (!chat) {
        chat = await this.chats.create({
          usersIds: [user._id, data.withId],
        });

        const withUser = await this.users.getById({ id: data.withId });

        (user.chats as Array<Id>).push(chat._id);
        (withUser.chats as Array<Id>).push(chat._id);

        await Promise.all([user.save(), withUser.save()]);
      }

      return chat;
    } catch (e) {}
  }

  @Mutation(() => Boolean)
  async chatMessageSend(
    @CurrentUser() user: UserDocument,
    @Args('data') data: ChatMessageSendInput,
  ): Promise<Boolean> {
    try {
      await this.chats.addMessage({ ...data, fromId: user._id });

      return true;
    } catch (e) {}
  }
}
