import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LoggerModule } from '../logger';

import { SupportMessage, SupportMessageSchema } from './schema';
import { SupportService } from './service';
import { SupportResolver } from './resolver';

@Module({
  imports: [
    LoggerModule,
    MongooseModule.forFeature([
      { name: SupportMessage.name, schema: SupportMessageSchema },
    ]),
  ],
  providers: [SupportService, SupportResolver],
})
export class SupportModule {}
