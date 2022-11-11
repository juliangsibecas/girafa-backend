import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { LoggerModule } from '../logger';

import { NotificationResolver } from './resolver';
import { Notification, NotificationSchema } from './schema';
import { NotificationService } from './service';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  exports: [NotificationService],
  providers: [NotificationService, NotificationResolver],
})
export class NotificationModule {}
