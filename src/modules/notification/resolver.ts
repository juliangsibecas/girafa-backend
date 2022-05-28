import { Inject } from '@nestjs/common';
import { Args, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AllowAny } from '../auth/graphql';

import { Notification } from './schema';

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(
    @Inject('PUB_SUB')
    private pubSub: PubSub,
  ) {}

  @Subscription(() => Notification, {
    filter: (notification: Notification, { userId }: { userId: string }) => {
      return notification.user.id === userId;
    },
  })
  @AllowAny()
  notifications(@Args('userId') _userId: string): Notification {
    return this.pubSub.asyncIterator('aoeu') as unknown as Notification;
  }
}
