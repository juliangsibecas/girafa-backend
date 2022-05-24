import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { S3Service } from '../../core/s3';

import { User } from './schema';
import { UserService } from './service';
import { UserResolver } from './resolver';
import { UserController } from './controller';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User])],
  exports: [TypeOrmModule],
  providers: [UserService, UserResolver, S3Service],
  controllers: [UserController],
})
export class UserModule {}
