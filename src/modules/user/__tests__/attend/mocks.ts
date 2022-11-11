import { Entities } from '../../../../common/types';
import { MOCKED_PARTIES } from '../../../../modules/party/__mocks__/party';

import { MOCKED_USERS } from '../../__mocks__/user';

export const userChangeAttendingStateMocks: Entities = {
  users: MOCKED_USERS,
  parties: [MOCKED_PARTIES[0]],
  notifications: [],
};
