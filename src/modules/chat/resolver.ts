import { forwardRef, Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { Id } from 'src/common/types';

import { CurrentUser } from '../auth/graphql';
import { User, UserPreview, UserService } from '../user';
import { UserDocument } from '../user/schema';
import {
  ChatCreateInput,
  ChatGetIdByUserIdInput,
  ChatMessageSendInput,
  ChatMessageSentInput,
  ChatMessagesGetInput,
  ChatUserGetInput,
} from './input';
import { ChatNewMessageResponse, ChatPreview } from './response';

import { CHAT_MESSAGE_SENT } from './constant';
import { Chat, ChatDocument, ChatMessage } from './schema';
import { ChatService } from './service';
import { AuthService } from '../auth';
import { NotificationService, NotificationType } from '../notification';
import { createDeepLink } from 'src/common/utils';
import { NotFoundError, UnknownError } from 'src/core/graphql';
import { LoggerService } from '../logger';

@Resolver(() => Chat)
export class ChatResolver {
  constructor(
    private chats: ChatService,
    private logger: LoggerService,
    @Inject(forwardRef(() => NotificationService))
    private notifications: NotificationService,
    @Inject(forwardRef(() => AuthService)) private auth: AuthService,
    @Inject(forwardRef(() => UserService)) private users: UserService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {}

  @Query(() => [ChatPreview])
  async chatList(
    @CurrentUser() user: UserDocument,
  ): Promise<Array<ChatPreview>> {
    try {
      user = await user.populate({
        path: 'chats',
        select: { _id: 1, messages: { $slice: -1 } },
        populate: [
          {
            path: 'users',
            select: ['nickname', 'pictureId'],
          },
        ],
      });

      return ((user.chats as Array<Chat>) ?? [])
        .map((chat) => ({
          _id: chat._id,
          user: (chat.users as Array<User>).find(
            (otherUser) => otherUser._id !== user._id,
          )!,
          lastMessage: chat.messages.pop(),
        }))
        .sort(
          (chatA, chatB) =>
            chatB.lastMessage.createdAt.getTime() -
            chatA.lastMessage.createdAt.getTime(),
        );
    } catch (e) {
      this.logger.error({
        path: 'chatList',
        data: e,
      });

      throw new UnknownError();
    }
  }

  @Query(() => String)
  async chatGetIdByUserId(
    @CurrentUser() user: UserDocument,
    @Args('data') data: ChatGetIdByUserIdInput,
  ): Promise<Id> {
    try {
      const userWith = await this.users.getById({
        id: data.userId,
        select: ['chats'],
      });

      if (!user.chats.length || !userWith.chats.length) {
        return '';
      }

      return (
        (user.chats as Array<Id>).find(
          (chatId) => (userWith.chats as Array<Id>).indexOf(chatId) !== -1,
        ) ?? ''
      );
    } catch (e) {
      this.logger.error({
        path: 'chatGetIdByUserId',
        data: {
          data,
          e,
        },
      });

      throw new UnknownError();
    }
  }

  @Query(() => UserPreview)
  async chatUserGet(
    @CurrentUser() user: UserDocument,
    @Args('data') data: ChatUserGetInput,
  ): Promise<UserPreview> {
    try {
      const chat = await this.chats.getByid(data.id);

      if (!chat) {
        throw new NotFoundError();
      }

      return (chat.users as Array<User>).find(({ _id }) => _id !== user._id)!;
    } catch (e) {
      this.logger.error({
        path: 'chatUserGet',
        data: {
          data,
          e,
        },
      });

      throw new UnknownError();
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
    } catch (e) {
      this.logger.error({
        path: 'chatMessagesGet',
        data: {
          chatId,
          e,
        },
      });

      throw new UnknownError();
    }
  }

  @Mutation(() => ChatPreview)
  async chatCreate(
    @CurrentUser() user: UserDocument,
    @Args('data') data: ChatCreateInput,
  ): Promise<ChatPreview> {
    try {
      await user.populate({
        path: 'chats',
        populate: {
          path: 'users',
          select: ['nickname', 'pictureId'],
        },
      });

      let chat: Chat | ChatDocument = (user.chats as Array<Chat>).find(
        ({ users }) =>
          users.length === 2 &&
          (users as Array<User>).filter(({ _id }) =>
            [user._id, data.withId].includes(_id),
          ).length === 2,
      );

      if (!chat) {
        chat = (
          await this.chats.create({
            usersIds: [user._id, data.withId],
          })
        ).toObject();
      }

      const withUser = await this.users.getById({ id: data.withId });

      await Promise.all([
        this.users.addChat({ user, chatId: chat._id }),
        this.users.addChat({ user: withUser, chatId: chat._id }),
      ]);

      const message = await this.sendMessage({
        data: { chatId: chat._id, from: user, text: data.messageText },
      });

      return { ...chat, user: withUser, lastMessage: message };
    } catch (e) {
      this.logger.error({
        path: 'chatCreate',
        data: {
          data,
          e,
        },
      });

      throw new UnknownError();
    }
  }

  @Mutation(() => Boolean)
  async chatMessageSend(
    @CurrentUser() user: UserDocument,
    @Args('data') data: ChatMessageSendInput,
  ): Promise<Boolean> {
    try {
      await this.sendMessage({ data: { ...data, from: user } });

      return true;
    } catch (e) {
      this.logger.error({
        path: 'chatMessageSend',
        data: {
          data,
          e,
        },
      });

      throw new UnknownError();
    }
  }

  @Subscription(() => ChatNewMessageResponse, {
    filter: function (payload, variables) {
      const { userId } = this.auth.decodeToken(variables.data.token);

      return payload.chat.users.includes(userId);
    },
    resolve: (value) => {
      return { chatId: value.chat._id, ...value.message };
    },
  })
  chatMessageSent(@Args('data') _: ChatMessageSentInput) {
    return this.pubSub.asyncIterator(CHAT_MESSAGE_SENT);
  }

  //
  // HELPERS
  //

  async sendMessage({
    data: { chatId, from, text },
  }: {
    data: { chatId: Id; from: User; text: string };
  }) {
    const message = await this.chats.addMessage({
      chatId,
      fromId: from._id,
      text,
    });

    const users = await this.chats.getUsers(chatId);

    await Promise.all([
      this.pubSub.publish(CHAT_MESSAGE_SENT, {
        chat: {
          _id: chatId,
          users,
        },
        message,
      }),
      this.notifications.rawPush({
        toIds: users.filter((id) => id !== from._id),
        title: from.nickname,
        text,
        data: {
          type: NotificationType.CHAT,
          url: createDeepLink(`chat/${chatId}`),
        },
      }),
    ]);

    return message;
  }
}
