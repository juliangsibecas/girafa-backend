import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UnknownError } from '../../core/graphql';
import { AllowAny } from '../auth/graphql';
import { Role, Roles } from '../auth/role';

import { LoggerService } from '../logger';
import { AppInfo } from './schema';
import { AppInfoService } from './service';
import { checkMeetMinVersion } from './utils';

@Resolver(() => AppInfo)
export class AppInfoResolver {
  constructor(private logger: LoggerService, private appInfo: AppInfoService) {}

  @Mutation(() => Boolean)
  @Roles([Role.ADMIN])
  async appInfoInitialize(): Promise<boolean> {
    try {
      await this.appInfo.initAppInfo();

      return true;
    } catch (e) {
      this.logger.error({
        path: 'AppInfoInitialize',
        data: {},
      });
      throw new UnknownError();
    }
  }

  @Query(() => Boolean)
  @AllowAny()
  async appInfoMeetMinVersion(
    @Args('version') version: string,
  ): Promise<boolean> {
    try {
      const minVersion = await this.appInfo.getMinVersion();

      return checkMeetMinVersion(minVersion, version);
    } catch (e) {
      this.logger.error({
        path: 'AppInfoMeetMinVersion',
        data: e,
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => Boolean)
  @Roles([Role.ADMIN])
  async appInfoChangeMinVersion(
    @Args('version') version: string,
  ): Promise<boolean> {
    try {
      await this.appInfo.setMinVersion(version);

      return true;
    } catch (e) {
      this.logger.error({
        path: 'AppInfoChangeMinVersion',
        data: { version },
      });
      throw new UnknownError();
    }
  }
}
