import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { LoggerModule } from '../logger';
import { AppInfo, AppInfoSchema } from './schema';
import { AppInfoService } from './service';
import { AppInfoResolver } from './resolver';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    MongooseModule.forFeature([{ name: AppInfo.name, schema: AppInfoSchema }]),
  ],
  exports: [AppInfoService],
  providers: [AppInfoService, AppInfoResolver],
})
export class AppInfoModule {}
