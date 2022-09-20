import { Query, Resolver } from '@nestjs/graphql';

import { Id } from '../../common/types';
import { UnknownError } from '../../core/graphql';

import { CurrentUser } from '../auth/graphql';
import { LoggerService } from '../logger';

import { UserNotification } from './response';
import { Notification } from './schema';
import { NotificationService } from './service';

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(
    private logger: LoggerService,
    private notifications: NotificationService,
  ) {}

  @Query(() => [UserNotification])
  getNotifications(
    @CurrentUser() userId: Id,
  ): Promise<Array<UserNotification>> {
    try {
      return this.notifications.getByUserId(userId);
    } catch (e) {
      this.logger.error({
        path: 'getNotifications',
        data: {
          userId,
        },
      });
      throw new UnknownError();
    }
  }
}
