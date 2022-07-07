import * as OneSignal from '@onesignal/node-onesignal';
import { Injectable } from '@nestjs/common';

import { NotificationCreateDto, NotificationDebounceDto } from './dto';
import { Notification, NotificationDocument } from './schema';
import { NotificationType } from './type';
import { insertObjectIf } from 'src/common/utils';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Id } from 'src/common/types';

@Injectable()
export class NotificationService {
  onesignal: OneSignal.DefaultApi;

  constructor(
    @InjectModel(Notification.name)
    private notifications: Model<NotificationDocument>,
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

  async getByUserId(id: Id): Promise<Array<Notification>> {
    return this.notifications.find(
      { user: { _id: id } },
      ['type', 'createdAt'],
      {
        populate: ['from', 'party'],
        sort: { createdAt: -1 },
      },
    );
  }

  async create(dto: NotificationCreateDto): Promise<void> {
    const alreadyNotified = false && (await this.debounce(dto));

    if (!alreadyNotified) {
      const { type, user, from, party } = dto;
      const notification = await this.notifications.create({
        type,
        user: user._id,
        from: from._id,
        ...insertObjectIf(type === NotificationType.INVITE, {
          party,
        }),
      });

      await this.push({
        ...notification.toJSON(),
        user,
        from,
        party,
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

  async push({ _id, from, type, user, party, createdAt }: Notification) {
    const body =
      type === NotificationType.FOLLOW
        ? `${from.nickname} ahora te sigue`
        : `${from.nickname} te invito a ${party?.name}`;

    await this.onesignal.createNotification({
      app_id: '1f129d21-afb8-4933-9863-e1ff0ce80f2f',
      external_id: _id,
      included_segments: [],
      include_external_user_ids: [user._id.toString()],
      contents: { en: body },
      data: {
        _id,
        type,
        from: { _id: from._id, nickname: from.nickname },
        ...insertObjectIf(type === NotificationType.INVITE, {
          party: { _id: party?._id, name: party?.name },
        }),
        createdAt,
      },
    });
    // this.pubSub.publish('aoeu', notification);
  }
}
