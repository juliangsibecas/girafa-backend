import { User } from './schema';

export class UserCreateDto {
  email: string;
  nickname: string;
  password: string;
  fullName: string;
  birthdate: Date;
}

export class UserGetByIdDto {
  id: string;
  select?: Array<keyof User>;
  relations?: Array<keyof User>;
}

export class UserGetByEmailDto {
  email: string;
  select?: Array<keyof User>;
}

export class UserCheckAvailabilityDto {
  email: string;
  nickname: string;
}

export class UserChangeFollowingStateDto {
  user: User;
  following: User;
}

export class UserSetRecoveryCodeDto {
  id: string;
  code: string;
}

export class UserSetRefreshTokenDto {
  id: string;
  token: string;
}
