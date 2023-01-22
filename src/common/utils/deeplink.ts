import { NotificationType } from '../../modules/notification/types';

const scheme = 'girafa://';

const dict = {
  [NotificationType.FOLLOW]: 'user',
  [NotificationType.INVITE]: 'party',
};

export const createDeepLink = (str: string) => `${scheme}${str}`;

export const notificationTypeToDeepLink = (type: NotificationType) =>
  createDeepLink(dict[type]);
