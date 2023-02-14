import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Chat, ChatSchema } from './schema';
import { ChatService } from './service';
import { ChatResolver } from './resolver';
import { LoggerModule } from '../logger';
import { UserModule } from '../user';

@Module({
  imports: [
    LoggerModule,
    forwardRef(() => UserModule),
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
  ],
  exports: [ChatService],
  providers: [ChatService, ChatResolver],
})
export class ChatModule {}
