import { v4 } from 'uuid';

import { MOCKED_USERS } from '../../../modules/user/__mocks__/user';
import { Notification } from '../schema';
import { NotificationType } from '../types';

export const mockNotification = (
  data: Partial<Notification>,
): Notification => ({
  _id: v4(),
  type: NotificationType.FOLLOW,
  from: MOCKED_USERS[0],
  user: MOCKED_USERS[1],
  createdAt: new Date(),
  ...data,
});
