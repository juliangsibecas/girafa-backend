import { Entities } from '../../../../common/types';
import { MOCKED_PARTIES } from '../../../../modules/party';

import { MOCKED_USERS } from '../../__mocks__/user';

const [sibe, gumpy, cosmo, guayra] = MOCKED_USERS;

export const userDeleteMocks: Entities = {
  users: [
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
  ],
  parties: [
    {
      ...MOCKED_PARTIES[0],
      organizer: cosmo,
      attenders: [sibe, gumpy],
      attendersCount: 2,
    },
  ],
  notifications: [],
};
