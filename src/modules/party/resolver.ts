import { forwardRef, Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Id } from 'src/common/types';
import { CurrentUser } from '../auth/graphql';
import { UserService } from '../user';
import { PartyCreateInput } from './input';

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

  @Query(() => [Party])
  partySearch(
    @CurrentUser() userId: Id,
    @Args('q', { nullable: true }) q: string,
  ): Promise<Array<Party>> {
    return this.parties.search({ userId, q });
  }

  @Query(() => Party)
  partyGetById(@Args('id', { type: () => String }) id: Id): Promise<Party> {
    return this.parties.getById({ id, relations: ['organizer', 'attenders'] });
  }
}
