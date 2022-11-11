import { Server } from 'https';
import { Party } from '../../../modules/party';
import { User } from '../../../modules/user';
import { Notification } from '../../../modules/notification';

export type Params = {
  server: Server;
  users: Array<User>;
  parties: Array<Party>;
  notifications: Array<Notification>;
};
