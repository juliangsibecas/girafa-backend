import { registerAs } from '@nestjs/config';

export interface MailerConfig {
  service?: string;
  host?: string;
  port?: number;
  user: string;
  password: string;
}

export const mailerConfig = registerAs(
  'mailer',
  (): MailerConfig => ({
    service: process.env.MAILER_SERVICE,
    host: process.env.MAILER_HOST,
    port: parseInt(process.env.MAILER_PORT),
    user: process.env.MAILER_USER,
    password: process.env.MAILER_PASSWORD,
  }),
);
