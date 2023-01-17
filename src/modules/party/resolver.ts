import { forwardRef, Inject, UnauthorizedException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { createDeepLink } from 'src/common/utils';

import { Id } from '../../common/types';
import {
  ErrorCode,
  ForbiddenError,
  NotFoundError,
  UnknownError,
} from '../../core/graphql';

import { CurrentUser } from '../auth/graphql';
import { Role, Roles } from '../auth/role';
import { Features, FeatureToggleName } from '../featureToggle';
import { LoggerService } from '../logger';
import { NotificationService } from '../notification';
import { User, UserPreview, UserService } from '../user';
import { UserDocument } from '../user/schema';

import { PartyCreateInput, PartySearchAttendersInput } from './input';
import {
  PartyGetByIdResponse,
  PartyMapPreview,
  PartyPreview,
} from './response';
import { Party } from './schema';
import { PartyService } from './service';

@Resolver(() => Party)
export class PartyResolver {
  constructor(
    private logger: LoggerService,
    private parties: PartyService,
    @Inject(forwardRef(() => NotificationService))
    private notifications: NotificationService,
    @Inject(forwardRef(() => UserService)) private users: UserService,
  ) {}

  @Mutation(() => String)
  @Features([FeatureToggleName.PARTY_CREATE])
  async partyCreate(
    @CurrentUser() user: UserDocument,
    @Args('data') data: PartyCreateInput,
  ): Promise<string> {
    try {
      await this.parties.checkAvailability(data.name);

      const party = await this.parties.create({
        ...data,
        organizer: user._id,
      });

      await this.users.addOrganizedParty({
        user,
        party,
      });

      return party._id;
    } catch (e) {
      if (e.message === ErrorCode.VALIDATION_ERROR) {
        throw e;
      }

      this.logger.error({
        path: 'partyCreate',
        data: {
          userId: user._id,
          ...data,
        },
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => Boolean)
  @Roles([Role.ADMIN])
  async partyEnable(
    @CurrentUser() user: UserDocument,
    @Args('id') partyId: string,
  ): Promise<Boolean> {
    try {
      if (!user) throw new Error();

      const party = await this.parties.enable(partyId);

      if (party) {
        const organizer = await this.users.getById({
          id: party.organizer as unknown as Id,
          select: ['email', 'attendedParties'],
        });

        await this.parties.addAttender({ user: organizer, party });
        await this.users.attend({ user: organizer, party });

        await this.notifications.rawPush({
          toIds: [organizer._id],
          text: `${party.name} fue aceptada 😎`,
          data: {
            partyId: party._id,
            url: createDeepLink(`party/${party._id}`),
          },
        });

        return true;
      }

      return false;
    } catch (e) {
      if (e.message === ErrorCode.FORBIDDEN_ERROR) throw e;

      this.logger.error({
        path: 'partyEnable',
        code: e.message,
        data: {
          userId: user._id,
          partyId,
        },
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => Boolean)
  @Features([FeatureToggleName.PARTY_DELETE])
  async partyDelete(
    @CurrentUser() user: UserDocument,
    @Args('id') partyId: Id,
  ): Promise<Boolean> {
    try {
      const party = await this.parties.getById({ id: partyId });

      await Promise.all([
        Promise.all(
          (party.attenders as Array<Id>).map(async (attenderId) =>
            this.users.unattend({
              party,
              user: await this.users.getById({ id: attenderId }),
            }),
          ),
        ),
        this.notifications.deleteByParty(partyId),
        party.remove(),
      ]);

      return true;
    } catch (e) {
      this.logger.error({
        path: 'partyDelete',
        code: e.message,
        data: {
          userId: user._id,
          partyId,
        },
      });
      throw new UnknownError();
    }
  }

  @Query(() => [PartyMapPreview])
  @Features([FeatureToggleName.PARTY_GET])
  partyFind(
    @CurrentUser() user: UserDocument,
  ): Promise<Array<PartyMapPreview>> {
    try {
      return this.parties.find({ userId: user._id });
    } catch (e) {
      this.logger.error({
        path: 'partyFind',
        data: {
          userId: user._id,
        },
      });
      throw new UnknownError();
    }
  }

  @Query(() => [PartyPreview])
  @Features([FeatureToggleName.PARTY_GET])
  partySearch(
    @CurrentUser() user: UserDocument,
    @Args('q', { nullable: true }) q: string = '',
  ): Promise<Array<PartyPreview>> {
    try {
      return this.parties.search({ userId: user._id, q });
    } catch (e) {
      this.logger.error({
        path: 'partySearch',
        data: {
          userId: user._id,
          q,
        },
      });
      throw new UnknownError();
    }
  }

  @Query(() => PartyGetByIdResponse)
  @Features([FeatureToggleName.PARTY_GET])
  async partyGetById(
    @CurrentUser() user: UserDocument,
    @Args('id', { type: () => String }) partyId: Id,
  ): Promise<PartyGetByIdResponse> {
    try {
      const party = await this.parties.getById({
        id: partyId,
        relations: [
          'organizer',
          {
            path: 'attenders',
            options: {
              limit: 10,
            },
          },
        ],
      });

      if (!party) throw new NotFoundError();

      if (!(await this.parties.userCanAttend({ party, user })))
        throw new ForbiddenError();

      return {
        ...party.toObject(),
        isAttender: Boolean(
          (user.attendedParties as Array<Id>).find((id) => id === partyId),
        ),
        isOrganizer: user._id === party.organizer?._id,
      };
    } catch (e) {
      if (
        [ErrorCode.FORBIDDEN_ERROR, ErrorCode.NOT_FOUND_ERROR].includes(
          e.message,
        )
      )
        throw e;
      this.logger.error({
        path: 'partyGetById',
        data: {
          userId: user._id,
          partyId,
        },
      });
      throw new UnknownError();
    }
  }

  @Query(() => [UserPreview])
  @Features([
    FeatureToggleName.PARTY_GET,
    FeatureToggleName.PARTY_SEARCH_ATTENDERS,
  ])
  async partySearchAttenders(
    @CurrentUser() user: UserDocument,
    @Args('data') data: PartySearchAttendersInput,
  ): Promise<Array<User>> {
    try {
      const like = { $regex: data.q ?? '', $options: 'i' };

      const party = await this.parties.getById({
        id: data.id,
        select: ['_id', 'availability', 'invited'],
        relations: [
          'organizer',
          {
            path: 'attenders',
            select: ['_id', 'nickname', 'fullName'],
            match: {
              $or: [{ nickname: like }, { fullName: like }],
            },
          },
        ],
      });

      if (!(await this.parties.userCanAttend({ party, user })))
        throw new UnauthorizedException();

      return party.attenders as Array<User>;
    } catch (e) {
      this.logger.error({
        path: 'partySearchAttenders',
        data: {
          userId: user._id,
          ...data,
        },
      });
      throw new UnknownError();
    }
  }
}
