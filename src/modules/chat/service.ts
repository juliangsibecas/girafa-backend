import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, now } from 'mongoose';

import { Id } from '../../common/types';

import { ChatCreateDto, ChatMessageCreateDto } from './dto';
import { Chat, ChatDocument } from './schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name)
    private chats: Model<ChatDocument>,
  ) {}

  create({ usersIds }: ChatCreateDto) {
    return this.chats.create({ users: usersIds, messages: [] });
  }

  async getByid(id: Id): Promise<ChatDocument> {
    return this.chats.findById(
      id,
      {},
      {
        populate: [
          {
            path: 'users',
            select: ['nickname', 'pictureId'],
          },
        ],
      },
    );
  }

  async getUsers(id: Id): Promise<Array<Id>> {
    const chat = await this.chats.findById(id, 'users');

    return chat.users as Array<Id>;
  }

  async getChatById(chatId: Id): Promise<ChatDocument> {
    return this.chats.findOne({ _id: chatId });
  }

  async addMessage({ chatId, fromId, text }: ChatMessageCreateDto) {
    const message = { fromId, text, createdAt: now() };

    await this.chats.findByIdAndUpdate(chatId, {
      $push: {
        messages: message,
      },
    });

    return message;
  }
}
