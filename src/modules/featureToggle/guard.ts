import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { FeatureToggleError } from '../../core/graphql';

import { FEATURE_TOGGLE_KEY } from './constant';
import { FeatureToggleService } from './service';
import { FeatureToggleMetadata } from './types';

@Injectable()
export class FeatureToggleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly featureToggles: FeatureToggleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<FeatureToggleMetadata>(
      FEATURE_TOGGLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!metadata) return true;

    const enabled = await this.featureToggles.checkMany(metadata.names);

    if (!enabled) {
      throw new FeatureToggleError();
    }

    return true;
  }
}
