import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Id } from 'src/common/types';

import { CurrentUser } from '../auth/graphql';

import { SupportSendMessageInput } from './input';
import { SupportMessage } from './schema';
import { SupportService } from './service';

@Resolver(() => SupportMessage)
export class SupportResolver {
  constructor(private supportMessages: SupportService) {}

  @Mutation(() => Boolean)
  async supportSendMessage(
    @CurrentUser() userId: Id,
    @Args('data') { subject, body }: SupportSendMessageInput,
  ): Promise<Boolean> {
    try {
      return Boolean(
        await this.supportMessages.createMessage({
          userId,
          subject,
          body,
        }),
      );
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
