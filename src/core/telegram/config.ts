import { registerAs } from '@nestjs/config';

export interface TelegramConfig {
  key: string;
  channels: {
    logs: string;
    analytics: string;
  };
}

export const telegramConfig = registerAs(
  'telegram',
  (): TelegramConfig => ({
    key: process.env.TELEGRAM_KEY,
    channels: {
      logs: process.env.TELEGRAM_LOGS_CHANNEL_ID,
      analytics: process.env.TELEGRAM_ANALYTICS_CHANNEL_ID,
    },
  }),
);
