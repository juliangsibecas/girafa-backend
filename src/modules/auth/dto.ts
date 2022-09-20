import { CustomContext, Id } from '../../common/types';

export type AuthGetTokenDto = {
  userId: Id;
  ctx?: CustomContext;
};
