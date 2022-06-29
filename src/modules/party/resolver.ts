import { forwardRef, Inject, UnauthorizedException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Id } from 'src/common/types';
import { CurrentUser } from '../auth/graphql';
import { User, UserService } from '../user';
import { PartyCreateInput, PartySearchAttendersInput } from './input';
import { PartyGetByIdResponse } from './response';

import { Party } from './schema';
import { PartyService } from './service';

@Resolver(() => Party)
export class PartyResolver {
  constructor(
    private parties: PartyService,
    @Inject(forwardRef(() => UserService)) private users: UserService,
  ) {}

  @Mutation(() => Party)
  async partyCreate(
    @CurrentUser() userId: Id,
    @Args('data') input: PartyCreateInput,
  ): Promise<Party> {
    const user = await this.users.getById({ id: userId });

    if (!user) throw new Error();

    await this.parties.checkAvailability(input.name);

    return this.parties.create({ ...input, organizer: user._id });
  }

  @Query(() => PartyGetByIdResponse)
  async partyGetById(
    @CurrentUser() userId: Id,
    @Args('id', { type: () => String }) partyId: Id,
  ): Promise<PartyGetByIdResponse> {
    const user = await this.users.getById({
      id: userId,
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

    if (!this.parties.userCanAttend({ party, user }))
      throw new UnauthorizedException();

    return {
      ...party.toObject(),
      isAttender: Boolean(
        user.attendedParties.find(({ _id }) => _id === partyId),
      ),
    };
  }

  @Query(() => [User])
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
      select: ['_id'],
      relations: [
        {
          path: 'attenders',
          select: ['_id', 'nickname', 'fullName'],
          match: {
            $or: [{ nickname: like }, { fullName: like }],
          },
        },
      ],
    });

    if (!this.parties.userCanAttend({ party, user }))
      throw new UnauthorizedException();

    return party.attenders;
  }

  @Query(() => [Party])
  partySearch(
    @CurrentUser() userId: Id,
    @Args('q', { nullable: true }) q: string = '',
  ): Promise<Array<Party>> {
    return this.parties.search({ userId, q });
  }
}
