import { Id } from '../../common/types';

export type SupportCreateMessageDto = {
  userId: Id;
  subject: string;
  body: string;
};
