import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationModule } from '../notification';
import { PartyModule } from '../party/module';

import { User, UserSchema } from './schema';
import { UserService } from './service';
import { UserResolver } from './resolver';
import { LoggerModule } from '../logger';
import { UserFollowSeeder } from './__tests__/follow/seeder';
import { UserDeleteSeeder } from './__tests__/delete/seeder';

@Module({
  imports: [
    LoggerModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => PartyModule),
    forwardRef(() => NotificationModule),
  ],
  exports: [UserService],
  providers: [UserService, UserResolver, UserFollowSeeder, UserDeleteSeeder],
})
export class UserModule {}
