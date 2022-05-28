import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PartyModule } from '../party/module';

import { User } from './schema';
import { UserService } from './service';
import { UserResolver } from './resolver';
import { NotificationModule } from '../notification';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => PartyModule),
    forwardRef(() => NotificationModule),
  ],
  exports: [TypeOrmModule, UserService],
  providers: [UserService, UserResolver],
})
export class UserModule {}
