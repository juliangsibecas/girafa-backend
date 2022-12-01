import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { FeatureToggle, FeatureToggleSchema } from './schema';
import { FeatureToggleService } from './service';
import { FeatureToggleResolver } from './resolver';
import { LoggerModule } from '../logger';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    MongooseModule.forFeature([
      { name: FeatureToggle.name, schema: FeatureToggleSchema },
    ]),
  ],
  exports: [FeatureToggleService],
  providers: [FeatureToggleService, FeatureToggleResolver],
})
export class FeatureToggleModule {}
