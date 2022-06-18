import { forwardRef, Inject, UnauthorizedException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Id } from 'src/common/types';
import { CurrentUser } from '../auth/graphql/decorators';
import { NotificationService } from '../notification/service';
import { NotificationType } from '../notification/type';
import { PartyService } from '../party/service';

import {
  UserChangeAttendingStateInput,
  UserChangeFollowingStateInput,
  UserSendPartyInviteInput,
} from './input';
import { User } from './schema';
import { UserService } from './service';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private users: UserService,
    @Inject(forwardRef(() => PartyService)) private parties: PartyService,
    @Inject(forwardRef(() => NotificationService))
    private notifications: NotificationService,
  ) {}

  @Query(() => [User])
  async userSearch(@Args('q') q: string): Promise<Array<User>> {
    const search = await this.users.search(q);

    return search;
  }

  @Query(() => User)
  userGetById(@Args('id', { type: () => String }) id: Id): Promise<User> {
    return this.users.getById({ id, relations: ['following'] });
  }

  @Mutation(() => Boolean)
  async userChangeFollowingState(
    @CurrentUser() userId: Id,
    @Args('data') { followingId, state }: UserChangeFollowingStateInput,
  ): Promise<boolean> {
    if (userId === followingId) throw new Error('Same user');

    const user = await this.users.getById({
      id: userId,
      select: ['fullName'],
      relations: ['following', 'followers'],
    });

    const following = await this.users.getById({
      id: followingId,
      select: ['fullName'],
    });

    if (!user || !following) throw new Error('User not found');

    if (state) {
      await this.users.follow({ user, following });

      await this.notifications.create({
        type: NotificationType.FOLLOW,
        user: following,
        from: user,
      });
    } else {
      await this.users.unfollow({ user, following });
    }

    return true;
  }

  @Mutation(() => Boolean)
  async userChangeAttendingState(
    @CurrentUser() userId: Id,
    @Args('data') { partyId, state }: UserChangeAttendingStateInput,
  ): Promise<boolean> {
    const user = await this.users.getById({
      id: userId,
    });

    const party = await this.parties.getById({
      id: partyId,
      relations: ['organizer'],
    });

    if (!user || !party) throw new Error();

    if (!(await this.parties.userCanAttend({ user, party }))) {
      throw new UnauthorizedException();
    }

    if (state) {
      await this.users.attend({ user, party });
      await this.parties.addAttender({ user, party });
    } else {
      await this.users.unattend({ user, party });
      await this.parties.removeAttender({ user, party });
    }

    return true;
  }

  @Mutation(() => Boolean)
  async userSendPartyInvite(
    @CurrentUser() userId: Id,
    @Args('data') { partyId, invitedId }: UserSendPartyInviteInput,
  ): Promise<Boolean> {
    // avoid being re-invited by the same user

    if (userId === invitedId) throw new Error('Same user');

    const party = await this.parties.getById({
      id: partyId,
      select: ['allowInivites'],
      relations: ['organizer', 'invited'],
    });

    if (!party.allowInivites && !party.organizer._id.equals(userId))
      throw new UnauthorizedException();

    const user = await this.users.getById({
      id: userId,
      select: ['fullName'],
    });

    const invited = await this.users.getById({
      id: invitedId,
      select: ['fullName'],
    });

    if (!user || !invited) throw new Error('User not found');

    await this.parties.addInvited({ party, user: invited });

    await this.notifications.create({
      type: NotificationType.INVITE,
      user: invited,
      from: user,
      party,
    });

    return true;
  }
}
