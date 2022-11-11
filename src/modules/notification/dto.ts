import { Party } from '../party';
import { User } from '../user';
import { NotificationType } from './types';

export type NotificationCreateDto = {
  type: NotificationType;
  user: User;
  from: User;
  party?: Party;
};
