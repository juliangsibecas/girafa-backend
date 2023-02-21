import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PubSubModule } from '../../core/pubsub';

import { Chat, ChatSchema } from './schema';
import { ChatService } from './service';
import { ChatResolver } from './resolver';
import { LoggerModule } from '../logger/module';
import { UserModule } from '../user';
import { AuthModule } from '../auth';
import { NotificationModule } from '../notification';

@Module({
  imports: [
    LoggerModule,
    PubSubModule,
    forwardRef(() => AuthModule),
    LoggerModule,
    forwardRef(() => NotificationModule),
    forwardRef(() => UserModule),
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
  ],
  exports: [ChatService],
  providers: [ChatService, ChatResolver],
})
export class ChatModule {}
