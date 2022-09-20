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
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => PartyModule),
    forwardRef(() => NotificationModule),
  ],
  exports: [UserService],
  providers: [UserService, UserResolver, ...seeders],
})
export class UserModule {}
