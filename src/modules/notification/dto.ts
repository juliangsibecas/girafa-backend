import { Id } from '../../common/types';

import { Party } from '../party';
import { User } from '../user';
import { NotificationType } from './types';

export type NotificationCreateDto = {
  type: NotificationType;
  user: User;
  from: User;
  party?: Party;
};

export type RawPushNotification = {
  id?: Id;
  toIds: Array<Id>;
  text: string;
  data: { url: string } & Record<string, any>;
};
