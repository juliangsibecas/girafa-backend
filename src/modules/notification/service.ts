import * as OneSignal from '@onesignal/node-onesignal';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { insertObjectIf, notificationTypeToDeepLink } from '../../common/utils';
import { Environment, Id } from '../../common/types';

import { NotificationCreateDto, RawPushNotification } from './dto';
import { Notification, NotificationDocument } from './schema';
import { NotificationType } from './types';

@Injectable()
export class NotificationService {
  onesignal: OneSignal.DefaultApi;

  constructor(
    private config: ConfigService,
    @InjectModel(Notification.name)
    private notifications: Model<NotificationDocument>,
  ) {
    this.onesignal = new OneSignal.DefaultApi(
      OneSignal.createConfiguration({
        authMethods: {
          app_key: {
            tokenProvider: {
              getToken: () => this.config.get('onesignal.apiKey'),
            },
          },
        },
      }),
    );
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

  async create({
    type,
    user,
    from,
    party,
  }: NotificationCreateDto): Promise<void> {
    const oldNotification = await this.notifications.findOne({
      type,
      user: user._id,
      from: from._id,
      ...insertObjectIf(type === NotificationType.INVITE, {
        party,
      }),
    });

    if (oldNotification) {
      if (this.debounce(oldNotification)) {
        return;
      }

      oldNotification.delete();
    }

    const notification = await this.notifications.create({
      type,
      user: user._id,
      from: from._id,
      ...insertObjectIf(type === NotificationType.INVITE, {
        party,
      }),
    });

    if (this.config.get('app.env') !== Environment.TEST) {
      await this.push({
        ...notification.toJSON(),
        user,
        from,
        party,
      });
    }
  }

  async deleteByUser(userId: string): Promise<void> {
    await this.notifications.deleteMany({
      from: userId,
    });
  }

  async deleteByParty(partyId: string): Promise<void> {
    await this.notifications.deleteMany({
      party: partyId,
    });
  }

  debounce(notification: Notification) {
    const debounceDate = new Date();
    debounceDate.setHours(debounceDate.getHours() - 6);

    return Boolean(debounceDate < notification.createdAt);
  }

  async push({ _id, from, type, user, party, createdAt }: Notification) {
    const text =
      type === NotificationType.FOLLOW
        ? `${from.nickname} te sigue`
        : `${from.nickname} te invitó a ${party?.name}`;

    await this.rawPush({
      id: _id,
      toIds: [user._id],
      text,
      data: {
        _id,
        type,
        from: {
          _id: from._id,
          nickname: from.nickname,
          pictureId: from.pictureId,
        },
        ...insertObjectIf(type === NotificationType.INVITE, {
          party: { _id: party?._id, name: party?.name },
        }),
        createdAt,
        url: `${notificationTypeToDeepLink(type)}/${party?._id ?? from._id}`,
      },
    });
  }

  rawPush({ id, toIds, title, text, data }: RawPushNotification) {
    return this.onesignal.createNotification({
      app_id: this.config.get('onesignal.appId'),
      external_id: id,
      included_segments: [],
      include_external_user_ids: toIds,
      headings: { en: title },
      contents: { en: text },
      data,
    });
  }
}
