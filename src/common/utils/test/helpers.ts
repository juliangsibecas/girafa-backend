import { mutation, query } from 'gql-query-builder';

import { UserGetResponse } from '../../../modules/user';
import { AuthSignInInput } from '../../../modules/auth/input';
import { PartyGetResponse } from '../../../modules/party';
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

  async getUser(idx: number, byIdx?: number) {
    const operationName = 'userGet';

    const res = await this.exec<UserGetResponse>(
      query({
        operation: operationName,
        variables: {
          data: {
            type: `UserGetInput`,
            required: true,
            value: {
              id: this.users[idx]._id,
            },
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

  async getParty(idx: number, byIdx?: number) {
    const operationName = 'partyGet';

    const res = await this.exec<PartyGetResponse>(
      query({
        operation: operationName,
        variables: {
          data: {
            type: `PartyGetInput`,
            required: true,
            value: { id: this.parties[idx]._id },
          },
        },
        fields: ['attendersCount', 'isAttender'],
      }),
      byIdx,
    );

    return this.formatRes<PartyGetResponse>(res, operationName);
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
