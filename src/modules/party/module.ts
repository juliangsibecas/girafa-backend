import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { UserModule } from '../user/module';
import { LoggerModule } from '../logger';
import { NotificationModule } from '../notification';

import { Party, PartySchema } from './schema';
import { PartyService } from './service';
import { PartyResolver } from './resolver';
import { seeders } from './seeders';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    forwardRef(() => NotificationModule),
    forwardRef(() => UserModule),
    MongooseModule.forFeature([{ name: Party.name, schema: PartySchema }]),
  ],
  exports: [PartyService],
  providers: [PartyService, PartyResolver, ...seeders],
})
export class PartyModule {}
