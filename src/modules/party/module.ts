import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../user/module';

import { Party } from './schema';
import { PartyService } from './service';
import { PartyResolver } from './resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Party]), forwardRef(() => UserModule)],
  exports: [TypeOrmModule, PartyService],
  providers: [PartyService, PartyResolver],
})
export class PartyModule {}
