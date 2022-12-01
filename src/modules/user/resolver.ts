import { forwardRef, Inject, UnauthorizedException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Id } from '../../common/types';
import {
  ErrorCodes,
  ForbiddenError,
  NotFoundError,
  UnknownError,
} from '../../core/graphql';

import { CurrentUser } from '../auth/graphql/decorators';
import { Features, FeatureToggleName } from '../featureToggle';
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
import { User, UserDocument } from './schema';
import { UserService } from './service';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private logger: LoggerService,
    private users: UserService,
    private notifications: NotificationService,
    @Inject(forwardRef(() => PartyService)) private parties: PartyService,
  ) {}

  @Mutation(() => Boolean)
  @Features([FeatureToggleName.USER_EDIT])
  async userEdit(
    @CurrentUser() user: UserDocument,
    @Args('data') data: UserEditInput,
  ): Promise<Boolean> {
    try {
      if (user.nickname !== data.nickname) {
        await this.users.checkNicknameAvailability(data.nickname);
      }

      return Boolean(await this.users.edit({ id: user._id, ...data }));
    } catch (e) {
      if (e.message === ErrorCodes.VALIDATION_ERROR) {
        throw e;
      }

      this.logger.error({
        path: 'UserEdit',
        data: {
          userId: user._id,
          ...data,
        },
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => Boolean)
  @Features([FeatureToggleName.USER_DELETE])
  async userDelete(@CurrentUser() user: UserDocument): Promise<Boolean> {
    try {
      await Promise.all([
        Promise.all(
          (user.followers as unknown as Array<Id>).map(async (followerId) =>
            this.users.unfollow({
              user: await this.users.getById({ id: followerId }),
              following: user,
            }),
          ),
        ),
        Promise.all(
          (user.following as unknown as Array<Id>).map(async (followingId) =>
            this.users.unfollow({
              user,
              following: await this.users.getById({ id: followingId }),
            }),
          ),
        ),
        Promise.all(
          (user.attendedParties as unknown as Array<Id>).map(async (partyId) =>
            this.parties.removeAttender({
              user,
              party: await this.parties.getById({ id: partyId }),
            }),
          ),
        ),
        user.remove(),
      ]);

      return true;
    } catch (e) {
      if (e.message === ErrorCodes.VALIDATION_ERROR) {
        throw e;
      }

      this.logger.error({
        path: 'UserDelete',
        data: {
          userId: user._id,
        },
      });
      throw new UnknownError();
    }
  }

  @Query(() => [UserPreview])
  @Features([FeatureToggleName.USER_GET])
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
  @Features([FeatureToggleName.USER_GET])
  async userGetById(
    @CurrentUser() { _id: myId }: UserDocument,
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

      if (!user) throw new NotFoundError();

      return {
        ...user.toObject(),
        isFollowing: Boolean(
          (user.followers as unknown as Array<Id>).find((id) => id === myId),
        ),
      };
    } catch (e) {
      if (e.message === ErrorCodes.NOT_FOUND_ERROR) {
        throw e;
      }

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
  @Features([FeatureToggleName.USER_GET, FeatureToggleName.USER_GET_FOLLOWERS])
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

  @Features([FeatureToggleName.USER_GET, FeatureToggleName.USER_GET_FOLLOWING])
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
  @Features([
    FeatureToggleName.USER_GET,
    FeatureToggleName.USER_GET_ATTENDED_PARTIES,
  ])
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
  @Features([FeatureToggleName.USER_SEARCH_FOLLOWERS_TO_INVITE])
  async userSearchFollowersToInvite(
    @CurrentUser() { _id }: UserDocument,
    @Args('data') data: UserSearchFollowersToInviteInput,
  ): Promise<Array<User>> {
    try {
      const like = { $regex: data.q ?? '', $options: 'i' };

      const user = await this.users.getById({
        id: _id,
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
          userId: _id,
          ...data,
        },
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => Boolean)
  @Features([FeatureToggleName.USER_CHANGE_FOLLOWING_STATE])
  async userChangeFollowingState(
    @CurrentUser() user: UserDocument,
    @Args('data') data: UserChangeFollowingStateInput,
  ): Promise<boolean> {
    try {
      if (user._id === data.followingId) throw new Error('Same user');

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
          userId: user._id,
          ...data,
        },
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => Boolean)
  @Features([FeatureToggleName.USER_CHANGE_ATTENDING_STATE])
  async userChangeAttendingState(
    @CurrentUser() user: UserDocument,
    @Args('data') data: UserChangeAttendingStateInput,
  ): Promise<boolean> {
    try {
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
        throw new ForbiddenError();
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
      if (e.message) throw new ForbiddenError();

      this.logger.error({
        path: 'UserChangeAttendingState',
        data: {
          userId: user.id,
          ...data,
        },
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => Boolean)
  @Features([FeatureToggleName.USER_SEND_PARTY_INVITE])
  async userSendPartyInvite(
    @CurrentUser() user: UserDocument,
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
        (!party.allowInvites && party.organizer._id !== user._id)
      )
        throw new UnauthorizedException();

      // avaid auto-inviting
      const filteredInivitedId = data.invitedId.filter((id) => id !== user._id);

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
          userId: user._id,
          ...data,
        },
      });
      throw new UnknownError();
    }
  }
}
