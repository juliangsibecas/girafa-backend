import { Notification, NotificationService } from '../../modules/notification';
import { Party, PartyService } from '../../modules/party';
import { User, UserService } from '../../modules/user';

export type Entities = {
  users: Array<User>;
  parties: Array<Party>;
  notifications: Array<Notification>;
};

export type EntitiesServices = {
  users: UserService;
  parties: PartyService;
  notifications: NotificationService;
};
