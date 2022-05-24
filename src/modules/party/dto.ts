import { User } from '../user';
import { Party } from './schema';

export class PartyCreateDto {
  organizer: User;
  name: string;
  date: Date;
  address: string;
  openBar: boolean;
  description: string;
}

export class PartyGetByIdDto {
  id: string;
  select?: Array<keyof Party>;
  relations?: Array<keyof Party>;
}
