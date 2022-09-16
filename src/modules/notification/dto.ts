import { Party } from '../party';
import { User } from '../user';
import { NotificationType } from './type';

export type NotificationCreateDto = {
  type: NotificationType;
  user: User;
  from: User;
  party?: Party;
};
