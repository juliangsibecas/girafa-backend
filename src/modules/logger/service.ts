import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramException, TelegramService } from 'nestjs-telegram';

import { ErrorCode } from '../../core/graphql';

import { LoggerAnalyticDto, LoggerDebugDto, LoggerErrorDto } from './dto';

@Injectable()
export class LoggerService {
  private logger = new Logger();

  constructor(
    private config: ConfigService,
    private telegram: TelegramService,
  ) {}

  async analytic({ text }: LoggerAnalyticDto) {
    try {
      await this.telegram
        .sendMessage({
          chat_id: this.config.get('telegram.channels.analytics'),
          text,
        })
        .toPromise();
    } catch (e) {
      console.log((e as TelegramException).message);
    }
  }

  debug({ path, data }: LoggerDebugDto) {
    this.logger.log({ path, data });
  }

  async error({ path, code = ErrorCode.UNKNOWN_ERROR, data }: LoggerErrorDto) {
    await this.telegram
      .sendMessage({
        chat_id: this.config.get('telegram.channels.logs'),
        text: `
        <b>${path}</b> - ${code}
<code>${JSON.stringify(data)}</code>
`,
        parse_mode: 'html',
      })
      .toPromise();
  }
}
