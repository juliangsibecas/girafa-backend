import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from '../user/module';

import { Party, PartySchema } from './schema';
import { PartyService } from './service';
import { PartyResolver } from './resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Party.name, schema: PartySchema }]),
    forwardRef(() => UserModule),
  ],
  exports: [PartyService],
  providers: [PartyService, PartyResolver],
})
export class PartyModule {}
