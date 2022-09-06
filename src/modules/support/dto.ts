import { Id } from 'src/common/types';

export type SupportCreateMessageDto = {
  userId: Id;
  subject: string;
  body: string;
};
