import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { S3Service } from '../../core/s3';

import { ImageController } from './controller';

@Module({
  imports: [ConfigModule],
  providers: [S3Service],
  controllers: [ImageController],
})
export class ImageModule {}
