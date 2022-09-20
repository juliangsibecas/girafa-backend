import { INestApplication } from '@nestjs/common';
import { mutation, query } from 'gql-query-builder';

import { gql } from '../../core/graphql';
import { UserGetByIdResponse } from '../../modules/user';
import { AuthSignInInput } from '../../modules/auth/input';
import { PartyGetByIdResponse } from 'src/modules/party';

export const signIn = async (server: any, email: string) => {
  const operation = 'signIn';

  const res = await gql<{ [operation]: { accessToken: string } }>(
    server,
    mutation({
      operation,
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

  return {
    data: res.data ? res.data[operation] : null,
    errors: res.errors,
  };
};

export const getUserById = async (
  server: any,
  id: string,
  accessToken: string,
) => {
  const operation = 'userGetById';

  const res = await gql<{ [operation]: UserGetByIdResponse }>(
    server,
    query({
      operation,
      variables: {
        id: {
          type: `String`,
          required: true,
          value: id,
        },
      },
      fields: [
        'followersCount',
        'followingCount',
        'attendedPartiesCount',
        'isFollowing',
      ],
    }),
    accessToken,
  );

  return {
    data: res.data ? res.data[operation] : null,
    errors: res.errors,
  };
};

export const getPartyById = async (
  server: any,
  id: string,
  accessToken: string,
) => {
  const operation = 'partyGetById';

  const res = await gql<{ [operation]: PartyGetByIdResponse }>(
    server,
    query({
      operation,
      variables: {
        id: {
          type: `String`,
          required: true,
          value: id,
        },
      },
      fields: ['attendersCount', 'isAttender'],
    }),
    accessToken,
  );

  return {
    data: res.data ? res.data[operation] : null,
    errors: res.errors,
  };
};
