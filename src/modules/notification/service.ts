import { Inject, Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { NotificationCreateDto, NotificationDebounceDto } from './dto';
import { Notification } from './schema';
import { NotificationType } from './type';
import { insertObjectIf } from 'src/common/utils';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notifications: Repository<Notification>,
    @Inject('PUB_SUB')
    private pubSub: PubSub,
  ) {}

  async create(dto: NotificationCreateDto): Promise<void> {
    const alreadyNotified = this.debounce(dto);

    if (!alreadyNotified) {
      const { type, user, from, party } = dto;
      // weird issue when saving entiry user/from
      const notification = await this.notifications.save({
        type: type,
        user: <any>user.id,
        from: <any>from.id,
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
      where: {
        type,
        user: { id: user.id },
        from: { id: from.id },
        createdAt: MoreThan(debounceDate),
        ...insertObjectIf(type === NotificationType.INVITE, { party }),
      },
    });

    return Boolean(notification);
  }

  async push(notification: Notification) {
    this.pubSub.publish('aoeu', notification);
  }
}
