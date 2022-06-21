import { Inject, Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

import { NotificationCreateDto, NotificationDebounceDto } from './dto';
import { Notification, NotificationDocument } from './schema';
import { NotificationType } from './type';
import { insertObjectIf } from 'src/common/utils';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notifications: Model<NotificationDocument>,
    @Inject('PUB_SUB')
    private pubSub: PubSub,
  ) {}

  async create(dto: NotificationCreateDto): Promise<void> {
    const alreadyNotified = await this.debounce(dto);

    console.log(alreadyNotified);

    if (!alreadyNotified) {
      const { type, user, from, party } = dto;
      const notification = await this.notifications.create({
        type: type,
        user: user._id,
        from: from._id,
        ...insertObjectIf(type === NotificationType.INVITE, {
          party: party,
        }),
      });

      await this.push({
        ...notification,
        user,
        from,
      });
    }
  }

  async debounce({ type, user, from, party }: NotificationDebounceDto) {
    const debounceDate = new Date();
    debounceDate.setHours(debounceDate.getHours() - 6);

    const notification = await this.notifications.findOne({
      type,
      user: user._id,
      from: from._id,
      createdAt: { $gt: debounceDate },
      ...insertObjectIf(type === NotificationType.INVITE, { party }),
    });

    return Boolean(notification);
  }

  async push(notification: Notification) {
    this.pubSub.publish('aoeu', notification);
  }
}
