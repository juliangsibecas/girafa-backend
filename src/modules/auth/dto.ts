import { CustomContext, Id } from '../../common/types';

export type AuthComparePasswordDto = {
  raw: string;
  encrypted: string;
};

export type AuthGetTokenDto = {
  userId: Id;
  ctx?: CustomContext;
};
