import { mutation, query } from 'gql-query-builder';

import { UserGetResponse } from '../../../modules/user';
import { AuthSignInInput } from '../../../modules/auth/input';
import { PartyGetByIdResponse } from '../../../modules/party';
import { Notification } from '../../../modules/notification';

import { Params } from './types';
import { TestBase } from './base';
import { AuthSignInResponse } from 'src/modules/auth/response';

export class TestHelpers extends TestBase {
  constructor(params: Params) {
    super(params);
  }

  async signIn(email: string) {
    const operationName = 'signIn';

    const res = await super.exec<AuthSignInResponse>(
      mutation({
        operation: operationName,
        variables: {
          data: {
            type: `AuthSignInInput`,
            required: true,
            value: {
              email,
              password: '1234',
            } as AuthSignInInput,
          },
        },
        fields: ['accessToken'],
      }),
    );

    return this.formatRes<AuthSignInResponse>(res, operationName);
  }

  async getUserById(idx: number, byIdx?: number) {
    const operationName = 'userGetById';

    const res = await this.exec<UserGetResponse>(
      query({
        operation: operationName,
        variables: {
          id: {
            type: `String`,
            required: true,
            value: this.users[idx]._id,
          },
        },
        fields: [
          'followersCount',
          'followingCount',
          'attendedPartiesCount',
          'isFollowing',
        ],
      }),
      byIdx,
    );

    return this.formatRes<UserGetResponse>(res, operationName);
  }

  async getPartyById(idx: number, byIdx?: number) {
    const operationName = 'partyGetById';

    const res = await this.exec<PartyGetByIdResponse>(
      query({
        operation: operationName,
        variables: {
          id: {
            type: `String`,
            required: true,
            value: this.parties[idx]._id,
          },
        },
        fields: ['attendersCount', 'isAttender'],
      }),
      byIdx,
    );

    return this.formatRes<PartyGetByIdResponse>(res, operationName);
  }

  getNotificationsByUserId = async (byIdx?: number) => {
    const operationName = 'notificationsGetByUserId';

    const res = await this.exec<Array<Notification>>(
      query({
        operation: operationName,
        fields: ['type'],
      }),
      byIdx,
    );

    return this.formatRes<Array<Notification>>(res, operationName);
  };
}
