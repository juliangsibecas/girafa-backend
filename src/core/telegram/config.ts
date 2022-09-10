import { registerAs } from '@nestjs/config';

export interface TelegramConfig {
  key: string;
  channelId: string;
}

export const telegramConfig = registerAs(
  'telegram',
  (): TelegramConfig => ({
    key: process.env.TELEGRAM_KEY,
    channelId: process.env.TELEGRAM_CHANNEL_ID,
  }),
);
