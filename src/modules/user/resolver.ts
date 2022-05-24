import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/graphql/decorators';

import { UserChangeFollowingStateInput } from './input';
import { User } from './schema';
import { UserService } from './service';

@Resolver(() => User)
export class UserResolver {
  constructor(private service: UserService) {}

  @Query(() => [User])
  userSearch(@Args('q') q: string): Promise<Array<User>> {
    return this.service.search(q);
  }

  @Query(() => User)
  userGetById(@Args('id') id: string): Promise<User> {
    return this.service.getById({ id, relations: ['following'] });
  }

  @Mutation(() => Boolean)
  async userChangeFollowingState(
    @CurrentUser() userId: string,
    @Args('data') { followingId, state }: UserChangeFollowingStateInput,
  ): Promise<boolean> {
    if (userId === followingId) throw new Error();

    const user = await this.service.getById({
      id: userId,
      relations: ['following', 'followers'],
    });

    const following = await this.service.getById({
      id: followingId,
    });

    if (!user || !following) throw new Error();

    if (state) this.service.addFollowing({ user, following });
    else this.service.removeFollowing({ user, following });

    return true;
  }
}
