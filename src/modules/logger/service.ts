import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from 'nestjs-telegram';

import { ErrorCode } from '../../core/graphql';

import { LoggerDebugDto, LoggerErrorDto } from './dto';

@Injectable()
export class LoggerService {
  private logger = new Logger();

  constructor(
    private config: ConfigService,
    private telegram: TelegramService,
  ) {}

  async debug({ path, data }: LoggerDebugDto) {
    this.logger.log({ path, data });
  }

  async error({ path, code = ErrorCode.UNKNOWN_ERROR, data }: LoggerErrorDto) {
    this.telegram
      .sendMessage({
        chat_id: this.config.get('telegram.channelId') as string,
        text: `
        <b>${path}</b> - ${code}
<code>${JSON.stringify(data)}</code>
`,
        parse_mode: 'html',
      })
      .toPromise();
  }
}
