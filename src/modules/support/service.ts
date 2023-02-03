import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SupportMessage, SupportMessageDocument } from './schema';
import { SupportCreateMessageDto } from './dto';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(SupportMessage.name)
    private supportMessages: Model<SupportMessageDocument>,
  ) {}

  createMessage({
    userId,
    subject,
    body,
  }: SupportCreateMessageDto): Promise<SupportMessageDocument> {
    return this.supportMessages.create({ user: userId, subject, body });
  }

  //
  // ADMIN
  //

  async getCount(): Promise<number> {
    return await this.supportMessages.count();
  }
}
