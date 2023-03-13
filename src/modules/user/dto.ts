import { PopulateOptions } from 'mongoose';

import { Id } from '../../common/types';

import { PartyDocument } from '../party';
import { User, UserDocument } from './schema';
import { UserGender } from './types';

export interface UserCreateDto {
  fullName: string;
  nickname: string;
  email: string;
  password: string;
  gender?: UserGender;
  isOpera?: true;
}

export interface UserEditDto {
  id: Id;
  fullName: string;
  nickname: string;
  instagramUsername?: string;
}

export interface UserSearchDto {
  id: Id;
  search: string;
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

export interface UserGetByNicknameDto {
  nickname: string;
  select?: Array<keyof User>;
  relations?: Array<keyof User | PopulateOptions>;
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

export interface UserAddOrganizedPartyDto {
  user: UserDocument;
  party: PartyDocument;
}

export interface UserRemoveOrganizedPartyDto {
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

export interface UserAddChatDto {
  user: UserDocument;
  chatId: Id;
}
