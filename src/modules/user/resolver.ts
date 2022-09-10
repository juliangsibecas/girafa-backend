import { forwardRef, Inject, UnauthorizedException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Id } from 'src/common/types';
import { UnknownError } from 'src/core/graphql';
import { ErrorCodes } from 'src/core/graphql/utils';
import { CurrentUser } from '../auth/graphql/decorators';
import { LoggerService } from '../logger';
import { NotificationService, NotificationType } from '../notification';
import { PartyDocument, PartyPreview, PartyService } from '../party';

import {
  UserChangeAttendingStateInput,
  UserChangeFollowingStateInput,
  UserEditInput,
  UserSearchFollowersToInviteInput,
  UserSendPartyInviteInput,
} from './input';
import { UserGetByIdResponse, UserPreview } from './response';
import { User } from './schema';
import { UserService } from './service';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private logger: LoggerService,
    private users: UserService,
    @Inject(forwardRef(() => PartyService)) private parties: PartyService,
    @Inject(forwardRef(() => NotificationService))
    private notifications: NotificationService,
  ) {}

  @Mutation(() => Boolean)
  async userEdit(
    @CurrentUser() userId: Id,
    @Args('data') data: UserEditInput,
  ): Promise<Boolean> {
    try {
      const user = await this.users.getById({
        id: userId,
        select: ['nickname'],
      });

      if (user.nickname !== data.nickname) {
        await this.users.checkNicknameAvailability(data.nickname);
      }

      return Boolean(await this.users.edit({ id: userId, ...data }));
    } catch (e) {
      if (e.message === ErrorCodes.VALIDATION_ERROR) {
        throw e;
      }

      this.logger.error({
        path: 'UserEdit',
        data: {
          userId,
          ...data,
        },
      });
      throw new UnknownError();
    }
  }

  @Query(() => [UserPreview])
  userSearch(
    @Args('q', { nullable: true }) q: string = '',
  ): Promise<Array<UserPreview>> {
    try {
      return this.users.search(q);
    } catch (e) {
      this.logger.error({
        path: 'UserSearch',
        data: {
          q,
        },
      });
      throw new UnknownError();
    }
  }

  @Query(() => UserGetByIdResponse)
  async userGetById(
    @CurrentUser() myId: Id,
    @Args('id', { type: () => String }) id: Id,
  ): Promise<UserGetByIdResponse> {
    try {
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
    } catch (e) {
      this.logger.error({
        path: 'UserGetById',
        data: {
          myId,
          id,
        },
      });
      throw new UnknownError();
    }
  }

  @Query(() => [UserPreview])
  async userGetFollowersById(
    @Args('id', { type: () => String }) id: Id,
  ): Promise<Array<UserPreview>> {
    try {
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
    } catch (e) {
      this.logger.error({
        path: 'UserGetFollowersById',
        data: {
          id,
        },
      });
      throw new UnknownError();
    }
  }

  @Query(() => [UserPreview])
  async userGetFollowingById(
    @Args('id', { type: () => String }) id: Id,
  ): Promise<Array<UserPreview>> {
    try {
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
    } catch (e) {
      this.logger.error({
        path: 'UserGetFollowingById',
        data: {
          id,
        },
      });
      throw new UnknownError();
    }
  }

  @Query(() => [PartyPreview])
  async userGetAttendedPartiesById(
    @Args('id', { type: () => String }) id: Id,
  ): Promise<Array<PartyPreview>> {
    try {
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
    } catch (e) {
      this.logger.error({
        path: 'UserGetAttendedPartiesById',
        data: {
          id,
        },
      });
      throw new UnknownError();
    }
  }

  @Query(() => [User])
  async userSearchFollowersToInvite(
    @CurrentUser() userId: Id,
    @Args('data') data: UserSearchFollowersToInviteInput,
  ): Promise<Array<User>> {
    try {
      const like = { $regex: data.q, $options: 'i' };

      const user = await this.users.getById({
        id: userId,
        relations: [
          {
            path: 'followers',
            select: ['_id', 'nickname', 'fullName'],
            match: {
              nickname: like,
              fullName: like,
              attendedParties: { $ne: data.partyId },
            },
          },
        ],
      });

      return user.followers;
    } catch (e) {
      this.logger.error({
        path: 'UserSearchFollowersToInvite',
        data: {
          userId,
          ...data,
        },
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => Boolean)
  async userChangeFollowingState(
    @CurrentUser() userId: Id,
    @Args('data') data: UserChangeFollowingStateInput,
  ): Promise<boolean> {
    try {
      if (userId === data.followingId) throw new Error('Same user');

      const user = await this.users.getById({
        id: userId,
        select: ['nickname', 'following'],
      });

      const following = await this.users.getById({
        id: data.followingId,
        select: ['nickname'],
      });

      if (!user || !following) throw new Error('User not found');

      if (data.state) {
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
    } catch (e) {
      this.logger.error({
        path: 'UserChangeFollowingState',
        data: {
          userId,
          ...data,
        },
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => Boolean)
  async userChangeAttendingState(
    @CurrentUser() userId: Id,
    @Args('data') data: UserChangeAttendingStateInput,
  ): Promise<boolean> {
    try {
      const user = await this.users.getById({
        id: userId,
      });

      const party = await this.parties.getById({
        id: data.partyId,
        select: ['_id', 'availability', 'isExpired', 'attenders', 'invited'],
        relations: ['organizer'],
      });

      if (!user || !party) throw new Error();

      if (
        party.isExpired ||
        !(await this.parties.userCanAttend({ user, party }))
      ) {
        throw new UnauthorizedException();
      }

      if (data.state) {
        await this.users.attend({ user, party });
        await this.parties.addAttender({ user, party });
      } else {
        await this.users.unattend({ user, party });
        await this.parties.removeAttender({ user, party });
      }

      return true;
    } catch (e) {
      this.logger.error({
        path: 'UserChangeAttendingState',
        data: {
          userId,
          ...data,
        },
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => Boolean)
  async userSendPartyInvite(
    @CurrentUser() userId: Id,
    @Args('data') data: UserSendPartyInviteInput,
  ): Promise<Boolean> {
    try {
      // TODO: avoid being re-invited by the same user

      const party = await this.parties.getById({
        id: data.partyId,
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
      const filteredInivitedId = data.invitedId.filter((id) => id !== userId);

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
    } catch (e) {
      this.logger.error({
        path: 'UserSendPartyInvite',
        data: {
          userId,
          ...data,
        },
      });
      throw new UnknownError();
    }
  }
}
