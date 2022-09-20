import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramModule } from 'nestjs-telegram';

import { telegramModuleOptions } from '../../core/telegram';

import { LoggerService } from './service';

@Module({
  imports: [ConfigModule, TelegramModule.forRootAsync(telegramModuleOptions)],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
