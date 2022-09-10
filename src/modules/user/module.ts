import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationModule } from '../notification';
import { PartyModule } from '../party/module';

import { User, UserSchema } from './schema';
import { UserService } from './service';
import { UserResolver } from './resolver';
import { LoggerModule } from '../logger';

@Module({
  imports: [
    LoggerModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => PartyModule),
    forwardRef(() => NotificationModule),
  ],
  exports: [UserService],
  providers: [UserService, UserResolver],
})
export class UserModule {}
