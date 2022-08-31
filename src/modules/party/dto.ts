import { PopulateOptions } from 'mongoose';
import { Id } from 'src/common/types';
import { User } from '../user';
import { UserDocument } from '../user/schema';
import { Coordinate } from './coordinate';
import { Party, PartyDocument } from './schema';

export class PartyCreateDto {
  organizer: User;
  name: string;
  date: Date;
  address: string;
  coordinate: Coordinate;
  openBar: boolean;
  description: string;
  allowInvites: boolean;
}

export class PartyFindDto {
  userId: Id;
}

export class PartySearchDto {
  userId: Id;
  q?: string;
}

export class PartyGetByIdDto {
  id: Id;
  select?: Array<keyof Party>;
  relations?: Array<keyof Party | PopulateOptions>;
}

export class PartyChangeAttendingStateDto {
  party: PartyDocument;
  user: UserDocument;
}

export class PartyAddinvitedDto {
  party: PartyDocument;
  invitedId: Array<Id>;
}
