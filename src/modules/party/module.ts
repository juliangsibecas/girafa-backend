import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from '../user/module';

import { Party, PartySchema } from './schema';
import { PartyService } from './service';
import { PartyResolver } from './resolver';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../logger';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    MongooseModule.forFeature([{ name: Party.name, schema: PartySchema }]),
    forwardRef(() => UserModule),
  ],
  exports: [PartyService],
  providers: [PartyService, PartyResolver],
})
export class PartyModule {}
