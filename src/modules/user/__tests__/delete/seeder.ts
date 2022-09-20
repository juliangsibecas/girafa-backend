import { Injectable } from '@nestjs/common';

import { Party, PartyService } from '../../../../modules/party';
import { MOCKED_PARTIES } from '../../../../modules/party/__mocks__/party';
import { UserCreateDto } from '../../dto';

import { User } from '../../schema';
import { UserService } from '../../service';
import { MOCKED_USERS } from '../../__mocks__/user';

@Injectable()
export class UserDeleteSeeder {
  constructor(private users: UserService, private parties: PartyService) {}

  async run() {
    const [sibe, gumpy, cosmo, guayra] = MOCKED_USERS;

    const users: Array<User> = [
      {
        ...sibe,
        following: [gumpy],
        followingCount: 1,
        followers: [gumpy, cosmo, guayra],
        followersCount: 3,
        attendedParties: [MOCKED_PARTIES[0]],
        attendedPartiesCount: 1,
      },
      {
        ...gumpy,
        following: [sibe],
        followingCount: 1,
        followers: [sibe],
        followersCount: 1,
      },
      {
        ...cosmo,
        following: [sibe, guayra],
        followingCount: 2,
        followers: [guayra],
        followersCount: 1,
      },
      {
        ...guayra,
        following: [sibe, cosmo],
        followingCount: 2,
        followers: [cosmo],
        followersCount: 1,
      },
    ];

    const party: Party = {
      ...MOCKED_PARTIES[0],
      organizer: cosmo,
      attenders: [sibe, gumpy],
      attendersCount: 2,
    };

    await Promise.all([
      Promise.all(
        users.map((user) => this.users.create(user as UserCreateDto)),
      ),
      this.parties.create(party),
    ]);
  }
}
