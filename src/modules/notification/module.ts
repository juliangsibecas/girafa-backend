import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';

import { UserModule } from '../user/module';
import { NotificationResolver } from './resolver';

import { Notification } from './schema';
import { NotificationService } from './service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    forwardRef(() => UserModule),
  ],
  exports: [TypeOrmModule, NotificationService],
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
