import { forwardRef, Inject, UnauthorizedException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Id } from 'src/common/types';
import { CurrentUser } from '../auth/graphql/decorators';
import { NotificationService } from '../notification/service';
import { NotificationType } from '../notification/type';
import { PartyDocument, PartyPreview } from '../party';
import { PartyService } from '../party/service';

import {
  UserChangeAttendingStateInput,
  UserChangeFollowingStateInput,
  UserSearchFollowersToInviteInput,
  UserSendPartyInviteInput,
} from './input';
import { UserGetByIdResponse, UserPreview } from './response';
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

  @Query(() => [UserPreview])
  userSearch(
    @Args('q', { nullable: true }) q: string = '',
  ): Promise<Array<UserPreview>> {
    return this.users.search(q);
  }

  @Query(() => UserGetByIdResponse)
  async userGetById(
    @CurrentUser() myId: Id,
    @Args('id', { type: () => String }) id: Id,
  ): Promise<UserGetByIdResponse> {
    const user = await this.users.getById({
      id,
      select: [
        '_id',
        'nickname',
        'fullName',
        'followers',
        'followingCount',
        'followersCount',
        'attendedPartiesCount',
      ],
    });

    return {
      ...user.toObject(),
      isFollowing: Boolean(
        (user.followers as unknown as Array<Id>).find((id) => id === myId),
      ),
    };
  }

  @Query(() => [UserPreview])
  async userGetFollowersById(
    @Args('id', { type: () => String }) id: Id,
  ): Promise<Array<UserPreview>> {
    const user = await this.users.getById({
      id,
      select: ['_id'],
      relations: [
        {
          path: 'followers',
          select: ['_id', 'nickname', 'fullName'],
        },
      ],
    });

    return user.followers;
  }

  @Query(() => [UserPreview])
  async userGetFollowingById(
    @Args('id', { type: () => String }) id: Id,
  ): Promise<Array<UserPreview>> {
    const user = await this.users.getById({
      id,
      select: ['_id'],
      relations: [
        {
          path: 'following',
          select: ['_id', 'nickname', 'fullName'],
        },
      ],
    });

    return user.following;
  }

  @Query(() => [PartyPreview])
  async userGetAttendedPartiesById(
    @Args('id', { type: () => String }) id: Id,
  ): Promise<Array<PartyPreview>> {
    const user = await this.users.getById({
      id,
      select: ['_id'],
      relations: [
        {
          path: 'attendedParties',
          select: ['_id', 'name'],
          populate: {
            path: 'organizer',
            select: ['nickname'],
          },
        },
      ],
    });

    return user.attendedParties.map((party: PartyDocument) => ({
      ...party.toObject(),
      organizerNickname: party.organizer.nickname,
    }));
  }

  @Query(() => [User])
  async userSearchFollowersToInvite(
    @CurrentUser() userId: Id,
    @Args('data') { partyId, q }: UserSearchFollowersToInviteInput,
  ): Promise<Array<User>> {
    const like = { $regex: q, $options: 'i' };

    const user = await this.users.getById({
      id: userId,
      relations: [
        {
          path: 'followers',
          select: ['_id', 'nickname', 'fullName'],
          match: {
            nickname: like,
            fullName: like,
            attendedParties: { $ne: partyId },
          },
        },
      ],
    });

    return user.followers;
  }

  @Mutation(() => Boolean)
  async userChangeFollowingState(
    @CurrentUser() userId: Id,
    @Args('data') { followingId, state }: UserChangeFollowingStateInput,
  ): Promise<boolean> {
    if (userId === followingId) throw new Error('Same user');

    const user = await this.users.getById({
      id: userId,
      select: ['nickname', 'following'],
    });

    const following = await this.users.getById({
      id: followingId,
      select: ['nickname'],
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
      select: ['_id', 'availability', 'isExpired', 'attenders'],
      relations: ['organizer'],
    });

    if (!user || !party) throw new Error();

    if (
      party.isExpired ||
      !(await this.parties.userCanAttend({ user, party }))
    ) {
      console.log(!(await this.parties.userCanAttend({ user, party })));
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
    // TODO: avoid being re-invited by the same user

    const party = await this.parties.getById({
      id: partyId,
      select: ['name', 'allowInvites', 'isExpired'],
      relations: ['organizer', 'invited'],
    });

    if (
      party.isExpired ||
      (!party.allowInvites && party.organizer._id !== userId)
    )
      throw new UnauthorizedException();

    const user = await this.users.getById({
      id: userId,
      select: ['_id', 'nickname'],
    });

    // avaid auto-inviting
    const filteredInivitedId = invitedId.filter((id) => id !== userId);

    await this.parties.addInvited({ party, invitedId: filteredInivitedId });

    await Promise.all(
      filteredInivitedId.map(async (id) => {
        const invited = await this.users.getById({
          id: id,
          select: ['_id', 'nickname'],
        });

        return this.notifications.create({
          type: NotificationType.INVITE,
          user: invited,
          from: user,
          party,
        });
      }),
    );

    return true;
  }
}
