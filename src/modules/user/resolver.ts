import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/graphql/decorators';
import { PartyService } from '../party/service';

import {
  UserChangeAttendingStateInput,
  UserChangeFollowingStateInput,
} from './input';
import { User } from './schema';
import { UserService } from './service';

@Resolver(() => User)
export class UserResolver {
  constructor(private users: UserService, private parties: PartyService) {}

  @Query(() => [User])
  userSearch(@Args('q') q: string): Promise<Array<User>> {
    return this.users.search(q);
  }

  @Query(() => User)
  userGetById(@Args('id') id: string): Promise<User> {
    return this.users.getById({ id, relations: ['following'] });
  }

  @Mutation(() => Boolean)
  async userChangeFollowingState(
    @CurrentUser() userId: string,
    @Args('data') { followingId, state }: UserChangeFollowingStateInput,
  ): Promise<boolean> {
    if (userId === followingId) throw new Error();

    const user = await this.users.getById({
      id: userId,
      relations: ['following', 'followers'],
    });

    const following = await this.users.getById({
      id: followingId,
    });

    if (!user || !following) throw new Error();

    if (state) this.users.addFollowing({ user, following });
    else this.users.removeFollowing({ user, following });

    return true;
  }

  @Mutation(() => Boolean)
  async userChangeAttendingState(
    @CurrentUser() userId: string,
    @Args('data') { partyId, state }: UserChangeAttendingStateInput,
  ): Promise<boolean> {
    const user = await this.users.getById({
      id: userId,
      relations: ['attendedParties'],
    });

    const party = await this.parties.getById({
      id: partyId,
    });

    if (!user || !party) throw new Error();

    if (state) this.users.addAttending({ user, party });
    else this.users.removeAttending({ user, party });

    return true;
  }
}
