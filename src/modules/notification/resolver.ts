import { Query, Resolver } from '@nestjs/graphql';
import { Id } from 'src/common/types';
import { CurrentUser } from '../auth/graphql';
import { UserNotification } from './response';

import { Notification } from './schema';
import { NotificationService } from './service';

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private notifications: NotificationService) {}

  @Query(() => [UserNotification])
  getNotifications(
    @CurrentUser() userId: Id,
  ): Promise<Array<UserNotification>> {
    return this.notifications.getByUserId(userId);
  }
}
