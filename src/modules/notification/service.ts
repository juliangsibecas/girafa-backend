import * as OneSignal from '@onesignal/node-onesignal';
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
  onesignal: OneSignal.DefaultApi;

  constructor(
    @InjectModel(Notification.name)
    private notifications: Model<NotificationDocument>,
    @Inject('PUB_SUB')
    private pubSub: PubSub,
  ) {
    const config = OneSignal.createConfiguration({
      authMethods: {
        app_key: {
          tokenProvider: {
            getToken: () => 'ZWQzYzYzZTEtNDFkNC00NDQzLThkNTMtZmQ2OTc2NzgyNDgx',
          },
        },
      },
    });

    this.onesignal = new OneSignal.DefaultApi(config);
  }

  async create(dto: NotificationCreateDto): Promise<void> {
    const alreadyNotified = await this.debounce(dto);

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
    await this.onesignal.createNotification({
      app_id: '1f129d21-afb8-4933-9863-e1ff0ce80f2f',
      included_segments: [],
      contents: { en: 'Hola' },
      data: { hola: 'hola' },
      include_external_user_ids: [notification.user._id.toString()],
    });
    // this.pubSub.publish('aoeu', notification);
  }
}
