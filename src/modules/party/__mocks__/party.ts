import { v4 } from 'uuid';

import { MOCKED_USERS } from '../../../modules/user/__mocks__/user';

import { Party } from '../schema';
import { PartyAvailability } from '../types';

export const mockParty = (data: Pick<Party, 'name'>): Party => ({
  _id: v4(),
  availability: PartyAvailability.PUBLIC,
  allowInvites: true,
  date: new Date(),
  openBar: true,
  description: 'Descripcion',
  address: '17 N2906 ESQ 503',
  coordinate: {
    longitude: 0,
    latitude: 0,
  },
  attenders: [],
  attendersCount: 0,
  organizer: MOCKED_USERS[0],
  invited: [],
  isEnabled: true,
  isExpired: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...data,
});

export const MOCKED_PARTIES = [
  mockParty({
    name: 'Fiesta 1',
  }),
];
