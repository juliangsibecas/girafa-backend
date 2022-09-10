import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from 'nestjs-telegram';
import { ErrorCodes } from 'src/core/graphql/utils';
import { LoggerErrorDto } from './dto';

@Injectable()
export class LoggerService {
  constructor(
    private config: ConfigService,
    private telegram: TelegramService,
  ) {}

  async error({ path, code = ErrorCodes.UNKNOWN_ERROR, data }: LoggerErrorDto) {
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
