import { Entities } from '../../../../common/types';
import { MOCKED_PARTIES } from '../../../../modules/party';

import { MOCKED_USERS } from '../../__mocks__/user';

const [sibe, gumpy, cosmo, guayra] = MOCKED_USERS;

export const userDeleteMocks: Entities = {
  users: [
    {
      ...sibe,
      following: [gumpy],
      followers: [gumpy, cosmo, guayra],
      attendedParties: [MOCKED_PARTIES[0]],
    },
    {
      ...gumpy,
      following: [sibe],
      followers: [sibe],
    },
    {
      ...cosmo,
      following: [sibe, guayra],
      followers: [guayra],
    },
    {
      ...guayra,
      following: [sibe, cosmo],
      followers: [cosmo],
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
