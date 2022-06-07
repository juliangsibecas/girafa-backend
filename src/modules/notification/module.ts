import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PubSub } from 'graphql-subscriptions';

import { UserModule } from '../user/module';
import { NotificationResolver } from './resolver';

import { Notification, NotificationSchema } from './schema';
import { NotificationService } from './service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    forwardRef(() => UserModule),
  ],
  exports: [NotificationService],
  providers: [
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
    NotificationService,
    NotificationResolver,
  ],
})
export class NotificationModule {}
