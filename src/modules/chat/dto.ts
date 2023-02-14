import { Id } from 'src/common/types';

export type ChatCreateDto = {
  usersIds: Array<Id>;
};

export type ChatMessageCreateDto = {
  chatId: Id;
  fromId: Id;
  text: string;
};
