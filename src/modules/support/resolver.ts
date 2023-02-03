import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Id } from '../../common/types';
import { UnknownError } from '../../core/graphql';

import { CurrentUser } from '../auth/graphql';
import { Role, Roles } from '../auth/role';
import { Features, FeatureToggleName } from '../featureToggle';
import { LoggerService } from '../logger';
import { UserDocument } from '../user/schema';

import { SupportSendMessageInput } from './input';
import { SupportMessage } from './schema';
import { SupportService } from './service';

@Resolver(() => SupportMessage)
export class SupportResolver {
  constructor(
    private logger: LoggerService,
    private supportMessages: SupportService,
  ) {}

  @Mutation(() => Boolean)
  @Features([FeatureToggleName.MAILING])
  async supportSendMessage(
    @CurrentUser() user: UserDocument,
    @Args('data') data: SupportSendMessageInput,
  ): Promise<Boolean> {
    try {
      await this.logger.analytic({
        text: `${user.nickname} envió a soporte "${data.subject}"`,
      });

      return Boolean(
        await this.supportMessages.createMessage({
          userId: user.id,
          subject: data.subject,
          body: data.body,
        }),
      );
    } catch (e) {
      this.logger.error({
        path: 'supportSendMessage',
        data: { ...data },
      });
      throw new UnknownError();
    }
  }

  //
  // ADMIN
  //

  @Query(() => Number)
  @Roles([Role.ADMIN])
  async adminSupportGetCount(): Promise<Number> {
    try {
      return this.supportMessages.getCount();
    } catch (e) {
      this.logger.error({
        path: 'AdminSupportGetCount',
        data: {},
      });
      throw new UnknownError();
    }
  }
}
