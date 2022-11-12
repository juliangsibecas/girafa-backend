import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { S3Service } from '../../core/s3';
import { LoggerModule } from '../logger';

import { ImageController } from './controller';

@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [S3Service],
  controllers: [ImageController],
})
export class ImageModule {}
