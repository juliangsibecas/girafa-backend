import { forwardRef, Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
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
    @CurrentUser() userId: string,
    @Args('data') input: PartyCreateInput,
  ): Promise<Party> {
    const user = await this.users.getById({ id: userId });

    if (!user) throw new Error();

    await this.parties.checkAvailability(input.name);

    return this.parties.create({ ...input, organizer: user });
  }

  @Query(() => [Party])
  partySearch(@Args('q') q: string): Promise<Array<Party>> {
    return this.parties.search(q);
  }

  @Query(() => Party)
  partyGetById(@Args('id') id: string): Promise<Party> {
    return this.parties.getById({ id, relations: ['organizer', 'attenders'] });
  }
}
