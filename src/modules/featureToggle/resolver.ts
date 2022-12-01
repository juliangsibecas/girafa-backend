import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UnknownError } from '../../core/graphql';
import { AllowAny } from '../auth/graphql';
import { Role, Roles } from '../auth/role';

import { LoggerService } from '../logger';
import { FeatureToggleChangeValueInput } from './input';
import { FeatureToggle } from './schema';
import { FeatureToggleService } from './service';
import { FeatureToggleName } from './types';

@Resolver(() => FeatureToggle)
export class FeatureToggleResolver {
  constructor(
    private logger: LoggerService,
    private featureToggles: FeatureToggleService,
  ) {}

  @Query(() => [FeatureToggle])
  @Roles([Role.ADMIN])
  async featureToggleList(): Promise<Array<FeatureToggle>> {
    try {
      return this.featureToggles.list();
    } catch (e) {
      this.logger.error({
        path: 'FeatureToggleList',
        data: e,
      });
      throw new UnknownError();
    }
  }

  @Query(() => [FeatureToggleName])
  @AllowAny()
  async featureToggleGetEnabledNames(): Promise<Array<FeatureToggleName>> {
    try {
      return this.featureToggles.getEnabledNames();
    } catch (e) {
      this.logger.error({
        path: 'FeatureToggleGetEnabledNames',
        data: e,
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => Boolean)
  @Roles([Role.ADMIN])
  async featureToggleSync(): Promise<boolean> {
    try {
      await this.featureToggles.clear();
      await this.featureToggles.populate();

      return true;
    } catch (e) {
      this.logger.error({
        path: 'FeatureToggleSync',
        data: e,
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => Boolean)
  @Roles([Role.ADMIN])
  async featureToggleChangeValue(
    @Args('data') data: FeatureToggleChangeValueInput,
  ): Promise<boolean> {
    try {
      await this.featureToggles.changeValue(data);

      return true;
    } catch (e) {
      this.logger.error({
        path: 'FeatureToggleChangeValue',
        data: { ...data },
      });
      throw new UnknownError();
    }
  }
}
