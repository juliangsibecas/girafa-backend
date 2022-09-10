import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramModuleOptions } from 'nestjs-telegram';
import { TelegramConfig, telegramConfig } from './config';

export const telegramModuleOptions = {
  imports: [ConfigModule.forFeature(telegramConfig)],
  inject: [ConfigService],
  useFactory: async (config: ConfigService): Promise<TelegramModuleOptions> => {
    const telegram: TelegramConfig = config.get('telegram');

    return {
      botKey: telegram.key,
    };
  },
};

export { telegramConfig };
