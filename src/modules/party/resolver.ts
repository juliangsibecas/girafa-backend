import { forwardRef, Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ForbiddenError } from 'apollo-server-express';
import { Id } from 'src/common/types';
import { CurrentUser } from '../auth/graphql';
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
    private parties: PartyService,
    @Inject(forwardRef(() => UserService)) private users: UserService,
  ) {}

  @Mutation(() => String)
  async partyCreate(
    @CurrentUser() userId: Id,
    @Args('data') input: PartyCreateInput,
  ): Promise<string> {
    const user = await this.users.getById({ id: userId });

    if (!user) throw new Error();

    await this.parties.checkAvailability(input.name);

    const { _id } = await this.parties.create({
      ...input,
      organizer: user._id,
    });

    return _id;
  }

  @Mutation(() => Boolean)
  async partyEnable(
    @CurrentUser() userId: Id,
    @Args('id') id: string,
  ): Promise<Boolean> {
    const user = await this.users.getById({ id: userId, select: ['email'] });

    if (!user) throw new Error();
    if (user.email !== this.config.get('ADMIN_EMAIL'))
      throw new ForbiddenError('');

    try {
      const party = await this.parties.enable(id);
      if (party) {
        const organizer = await this.users.getById({
          id: party.organizer as unknown as string,
        });

        await this.parties.addAttender({ user: organizer, party });
        await this.users.attend({ user: organizer, party });

        return true;
      }

      return false;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  @Query(() => [PartyMapPreview])
  partyFind(@CurrentUser() userId: Id): Promise<Array<PartyMapPreview>> {
    return this.parties.find({ userId });
  }

  @Query(() => [PartyPreview])
  partySearch(
    @CurrentUser() userId: Id,
    @Args('q', { nullable: true }) q: string = '',
  ): Promise<Array<PartyPreview>> {
    return this.parties.search({ userId, q });
  }

  @Query(() => PartyGetByIdResponse)
  async partyGetById(
    @CurrentUser() userId: Id,
    @Args('id', { type: () => String }) partyId: Id,
  ): Promise<PartyGetByIdResponse> {
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
  }

  @Query(() => [UserPreview])
  async partySearchAttenders(
    @CurrentUser() userId: Id,
    @Args('data') { id: partyId, q = '' }: PartySearchAttendersInput,
  ): Promise<Array<User>> {
    const user = await this.users.getById({
      id: userId,
    });

    const like = { $regex: q, $options: 'i' };

    const party = await this.parties.getById({
      id: partyId,
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
  }
}
