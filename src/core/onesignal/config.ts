import { registerAs } from '@nestjs/config';

export interface OneSignalConfig {
  apiKey: string;
  appId: string;
}

export const onesignalConfig = registerAs(
  'onesignal',
  (): OneSignalConfig => ({
    apiKey: process.env.ONESIGNAL_API_KEY,
    appId: process.env.ONESIGNAL_APP_ID,
  }),
);
