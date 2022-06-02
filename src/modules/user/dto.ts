import { Party } from '../party';
import { User } from './schema';

export interface UserCreateDto {
  fullName: string;
  nickname: string;
  email: string;
  password: string;
}

export interface UserGetByIdDto {
  id: string;
  select?: Array<keyof User>;
  relations?: Array<keyof User>;
}

export interface UserGetByEmailDto {
  email: string;
  select?: Array<keyof User>;
}

export interface UserCheckAvailabilityDto {
  email: string;
  nickname: string;
}

export interface UserChangeFollowingStateDto {
  user: User;
  following: User;
}

export interface UserChangeAttendingStateDto {
  user: User;
  party: Party;
}

export interface UserSetRecoveryCodeDto {
  id: string;
  code: string;
}

export interface UserSetRefreshTokenDto {
  id: string;
  token: string;
}
