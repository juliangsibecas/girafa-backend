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

  async getMessages(chatId: Id) {
    const chat = await this.chats.findOne({ _id: chatId });

    return chat.messages;
  }

  addMessage({ chatId, fromId, text }: ChatMessageCreateDto) {
    return this.chats.findByIdAndUpdate(chatId, {
      $push: {
        messages: { fromId, text, createdAt: now() },
      },
    });
  }
}
