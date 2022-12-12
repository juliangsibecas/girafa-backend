import { Module } from '@nestjs/common';

import { TypesSyncResolver } from './resolver';

@Module({
  providers: [TypesSyncResolver],
})
export class TypesSyncModule {}
