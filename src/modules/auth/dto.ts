import { CustomContext, Id } from 'src/common/types';

export type AuthGetTokenDto = {
  userId: Id;
  ctx?: CustomContext;
};
