import { NotificationType } from '../../../../modules/notification/types';
import { Entities } from '../../../../common/types';
import { MOCKED_USERS } from '../../../../modules/user/__mocks__/user';
import { mockNotification } from '../../../../modules/notification/__mocks__/notification';

import { MOCKED_PARTIES } from '../../__mocks__/party';

const [sibe, gumpy, cosmo, guayra] = MOCKED_USERS;

export const partyDeleteMocks: Entities = {
  users: [
    {
      ...sibe,
      organizedParties: [MOCKED_PARTIES[0]._id],
      attendedParties: [MOCKED_PARTIES[0], MOCKED_PARTIES[1]],
    },
    {
      ...gumpy,
      attendedParties: [
        MOCKED_PARTIES[0],
        MOCKED_PARTIES[2],
        MOCKED_PARTIES[3],
      ],
    },
    {
      ...cosmo,
      attendedParties: [MOCKED_PARTIES[1]],
    },
    {
      ...guayra,
      attendedParties: [MOCKED_PARTIES[0]],
    },
  ],
  parties: [
    {
      ...MOCKED_PARTIES[0],
      organizer: sibe,
      attenders: [sibe, gumpy, guayra],
      attendersCount: 3,
    },
  ],
  notifications: [
    mockNotification({
      from: MOCKED_USERS[0],
      user: MOCKED_USERS[1],
    }),
    mockNotification({
      type: NotificationType.INVITE,
      from: MOCKED_USERS[0],
      user: MOCKED_USERS[1],
      party: MOCKED_PARTIES[0],
    }),
    mockNotification({
      type: NotificationType.INVITE,
      from: MOCKED_USERS[0],
      user: MOCKED_USERS[1],
      party: MOCKED_PARTIES[1],
    }),
    mockNotification({
      type: NotificationType.INVITE,
      from: MOCKED_USERS[1],
      user: MOCKED_USERS[0],
      party: MOCKED_PARTIES[0],
    }),
    mockNotification({
      type: NotificationType.INVITE,
      from: MOCKED_USERS[2],
      user: MOCKED_USERS[3],
      party: MOCKED_PARTIES[0],
    }),
  ],
};
