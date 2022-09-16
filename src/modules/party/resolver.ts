import { MailerService } from '@nestjs-modules/mailer';
import { forwardRef, Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ForbiddenError } from 'apollo-server-express';
import { Id } from 'src/common/types';
import { UnknownError } from 'src/core/graphql';
import { ErrorCodes } from 'src/core/graphql/utils';
import { CurrentUser } from '../auth/graphql';
import { LoggerService } from '../logger';
import { User, UserPreview, UserService } from '../user';

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
    private config: ConfigService,
    private logger: LoggerService,
    private mailer: MailerService,
    private parties: PartyService,
    @Inject(forwardRef(() => UserService)) private users: UserService,
  ) {}

  @Mutation(() => String)
  async partyCreate(
    @CurrentUser() userId: Id,
    @Args('data') data: PartyCreateInput,
  ): Promise<string> {
    try {
      const user = await this.users.getById({ id: userId });

      if (!user) throw new Error();

      await this.parties.checkAvailability(data.name);

      const { _id } = await this.parties.create({
        ...data,
        organizer: user._id,
      });

      return _id;
    } catch (e) {
      if (e.message === ErrorCodes.VALIDATION_ERROR) {
        throw e;
      }

      this.logger.error({
        path: 'partyCreate',
        data: {
          userId,
          ...data,
        },
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => Boolean)
  async partyEnable(
    @CurrentUser() userId: Id,
    @Args('id') partyId: string,
  ): Promise<Boolean> {
    try {
      const user = await this.users.getById({ id: userId, select: ['email'] });

      if (!user) throw new Error();
      if (user.email !== this.config.get('ADMIN_EMAIL'))
        throw new ForbiddenError('');

      const party = await this.parties.enable(partyId);

      if (party) {
        const organizer = await this.users.getById({
          id: party.organizer as unknown as string,
          select: ['email', 'attendedParties'],
        });

        await this.parties.addAttender({ user: organizer, party });
        await this.users.attend({ user: organizer, party });

        await this.mailer.sendMail({
          to: organizer.email,
          subject: 'Fiesta enabled',
          text: 'Fiesta enabled',
        });

        return true;
      }

      return false;
    } catch (e) {
      this.logger.error({
        path: 'partyEnable',
        code: e.message,
        data: {
          userId,
          partyId,
        },
      });
      throw new UnknownError();
    }
  }

  @Query(() => [PartyMapPreview])
  partyFind(@CurrentUser() userId: Id): Promise<Array<PartyMapPreview>> {
    try {
      return this.parties.find({ userId });
    } catch (e) {
      this.logger.error({
        path: 'partyFind',
        data: {
          userId,
        },
      });
      throw new UnknownError();
    }
  }

  @Query(() => [PartyPreview])
  partySearch(
    @CurrentUser() userId: Id,
    @Args('q', { nullable: true }) q: string = '',
  ): Promise<Array<PartyPreview>> {
    try {
      return this.parties.search({ userId, q });
    } catch (e) {
      this.logger.error({
        path: 'partySearch',
        data: {
          userId,
          q,
        },
      });
      throw new UnknownError();
    }
  }

  @Query(() => PartyGetByIdResponse)
  async partyGetById(
    @CurrentUser() userId: Id,
    @Args('id', { type: () => String }) partyId: Id,
  ): Promise<PartyGetByIdResponse> {
    try {
      const user = await this.users.getById({
        id: userId,
        relations: ['attendedParties'],
      });

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

      if (!(await this.parties.userCanAttend({ party, user })))
        throw new UnauthorizedException();

      return {
        ...party.toObject(),
        isAttender: Boolean(
          user.attendedParties.find(({ _id }) => _id === partyId),
        ),
        isOrganizer: userId === party.organizer._id,
      };
    } catch (e) {
      this.logger.error({
        path: 'partyGetById',
        data: {
          userId,
          partyId,
        },
      });
      throw new UnknownError();
    }
  }

  @Query(() => [UserPreview])
  async partySearchAttenders(
    @CurrentUser() userId: Id,
    @Args('data') data: PartySearchAttendersInput,
  ): Promise<Array<User>> {
    try {
      const user = await this.users.getById({
        id: userId,
      });

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

      return party.attenders;
    } catch (e) {
      this.logger.error({
        path: 'partySearchAttenders',
        data: {
          userId,
          ...data,
        },
      });
      throw new UnknownError();
    }
  }
}
