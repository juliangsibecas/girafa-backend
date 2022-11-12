import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerConfig, mailerConfig } from './config';

export const mailerModuleOptions = {
  imports: [ConfigModule.forFeature(mailerConfig)],
  inject: [ConfigService],
  useFactory: async (config: ConfigService): Promise<MailerOptions> => {
    const mailer: MailerConfig = config.get('mailer');

    return {
      transport: {
        service: mailer.service,
        host: mailer.host,
        port: mailer.port,
        auth: {
          user: mailer.user,
          pass: mailer.password,
        },
      },
      defaults: {
        from: `"Girafa" <${mailer.user}>`,
      },
    };
  },
};

export { mailerConfig };
