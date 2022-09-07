import { PopulateOptions } from 'mongoose';
import { Id } from 'src/common/types';
import { PartyDocument } from '../party';
import { User, UserDocument } from './schema';

export interface UserCreateDto {
  fullName: string;
  nickname: string;
  email: string;
  password: string;
}

export interface UserEditDto {
  id: Id;
  fullName: string;
  nickname: string;
}

export interface UserGetByIdDto {
  id: Id;
  select?: Array<keyof User>;
  relations?: Array<keyof User | PopulateOptions>;
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
  user: UserDocument;
  following: UserDocument;
}

export interface UserChangeAttendingStateDto {
  user: UserDocument;
  party: PartyDocument;
}

export interface UserSetRecoveryCodeDto {
  id: Id;
  code: string;
}

export interface UserSetPasswordDto {
  id: Id;
  password: string;
}

export interface UserSetRefreshTokenDto {
  id: Id;
  token: string;
}
