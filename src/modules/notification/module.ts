import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from '../logger';

import { UserModule } from '../user/module';
import { NotificationResolver } from './resolver';

import { Notification, NotificationSchema } from './schema';
import { NotificationService } from './service';

@Module({
  imports: [
    LoggerModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    forwardRef(() => UserModule),
  ],
  exports: [NotificationService],
  providers: [NotificationService, NotificationResolver],
})
export class NotificationModule {}
