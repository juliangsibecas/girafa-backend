import { Query, Resolver } from '@nestjs/graphql';

import { UnknownError } from '../../core/graphql';

import { CurrentUser } from '../auth/graphql';
import { Features, FeatureToggleName } from '../featureToggle';
import { LoggerService } from '../logger';
import { UserDocument } from '../user/schema';

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
  @Features([FeatureToggleName.NOTIFICATION_GET])
  notificationsGetByUserId(
    @CurrentUser() user: UserDocument,
  ): Promise<Array<UserNotification>> {
    try {
      return this.notifications.getByUserId(user._id);
    } catch (e) {
      this.logger.error({
        path: 'getNotifications',
        data: {
          userId: user._id,
        },
      });
      throw new UnknownError();
    }
  }
}
