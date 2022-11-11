import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationModule } from '../notification';
import { PartyModule } from '../party/module';
import { LoggerModule } from '../logger';

import { User, UserSchema } from './schema';
import { UserService } from './service';
import { UserResolver } from './resolver';
import { seeders } from './seeder';

@Module({
  imports: [
    LoggerModule,
    NotificationModule,
    forwardRef(() => PartyModule),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  exports: [UserService],
  providers: [UserService, UserResolver, ...seeders],
})
export class UserModule {}
