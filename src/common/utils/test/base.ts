import { Server } from 'https';

import { gql, Operation, Response } from '../../../core/graphql';
import { MOCKED_PARTIES, Party } from '../../../modules/party';
import { MOCKED_USERS, User } from '../../../modules/user';
import { Notification } from '../../../modules/notification';

import { Params } from './types';

export class TestBase {
  private server: Server;
  public users: Array<User> = [];
  public parties: Array<Party> = [];
  public notifications: Array<Notification> = [];
  public tokens: Array<string> = [];

  constructor({ server, users, parties, notifications }: Params) {
    this.server = server;
    this.users = users ?? MOCKED_USERS;
    this.parties = parties ?? MOCKED_PARTIES;
    this.notifications = notifications ?? [];
  }

  async exec<T>(operation: Operation, byIdx?: number) {
    return gql<T>(this.server, operation, this.tokens[byIdx ?? 0]);
  }

  async formatRes<T>(
    res: Response<any>,
    operation: string,
  ): Promise<Response<T>> {
    return {
      data: res.data ? res.data[operation] : null,
      errors: res.errors,
    } as Response<T>;
  }
}
