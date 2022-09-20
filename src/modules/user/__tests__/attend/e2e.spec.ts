import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mutation } from 'gql-query-builder';

import { AppModule } from '../../../../app';
import { gql } from '../../../../core/graphql';
import { getPartyById, getUserById, signIn } from '../../../../common/utils';
import { MOCKED_PARTIES } from '../../../../modules/party/__mocks__/party';

import { UserChangeAttendingStateInput } from '../../input';
import { MOCKED_USERS } from '../../__mocks__/user';

import { UserAttendSeeder } from './seeder';

describe('(E2E) User - Attend', () => {
  let app: INestApplication;
  let server: any;
  let seeder: UserAttendSeeder;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    seeder = module.get<UserAttendSeeder>(UserAttendSeeder);

    await seeder.run();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should attend', async () => {
    const attendOperation = 'userChangeAttendingState';

    const signInRes = await signIn(server, 'juliangsibecas@gmail.com');
    const token = signInRes.data.accessToken;

    const attendRes = await gql<{ [attendOperation]: boolean }>(
      server,
      mutation({
        operation: attendOperation,
        variables: {
          data: {
            type: `UserChangeAttendingStateInput`,
            required: true,
            value: {
              partyId: MOCKED_PARTIES[0]._id,
              state: true,
            } as UserChangeAttendingStateInput,
          },
        },
      }),
      token,
    );

    const getPartyByIdRes = await getPartyById(
      server,
      MOCKED_PARTIES[0]._id,
      token,
    );
    const getUserByIdRes = await getUserById(
      server,
      MOCKED_USERS[0]._id,
      token,
    );

    expect(attendRes.data[attendOperation]).toEqual(true);
    expect(getPartyByIdRes.data.isAttender).toEqual(true);
    expect(getPartyByIdRes.data.attendersCount).toEqual(1);
    expect(getUserByIdRes.data.attendedPartiesCount).toEqual(1);
  });

  it('should unattend', async () => {
    const attendOperation = 'userChangeAttendingState';

    const signInRes = await signIn(server, 'juliangsibecas@gmail.com');
    const token = signInRes.data.accessToken;

    const attendRes = await gql<{ [attendOperation]: boolean }>(
      server,
      mutation({
        operation: attendOperation,
        variables: {
          data: {
            type: `UserChangeAttendingStateInput`,
            required: true,
            value: {
              partyId: MOCKED_PARTIES[0]._id,
              state: false,
            } as UserChangeAttendingStateInput,
          },
        },
      }),
      token,
    );

    const getPartyByIdRes = await getPartyById(
      server,
      MOCKED_PARTIES[0]._id,
      token,
    );
    const getUserByIdRes = await getUserById(
      server,
      MOCKED_USERS[0]._id,
      token,
    );

    expect(attendRes.data[attendOperation]).toEqual(true);
    expect(getPartyByIdRes.data.isAttender).toEqual(false);
    expect(getPartyByIdRes.data.attendersCount).toEqual(0);
    expect(getUserByIdRes.data.attendedPartiesCount).toEqual(0);
  });

  it('should not unattend an unatteded party', async () => {
    const attendOperation = 'userChangeAttendingState';

    const signInRes = await signIn(server, 'juliangsibecas@gmail.com');
    const token = signInRes.data.accessToken;

    const attendRes = await gql<{ [attendOperation]: boolean }>(
      server,
      mutation({
        operation: attendOperation,
        variables: {
          data: {
            type: `UserChangeAttendingStateInput`,
            required: true,
            value: {
              partyId: MOCKED_PARTIES[0]._id,
              state: false,
            } as UserChangeAttendingStateInput,
          },
        },
      }),
      token,
    );

    const getPartyByIdRes = await getPartyById(
      server,
      MOCKED_PARTIES[0]._id,
      token,
    );
    const getUserByIdRes = await getUserById(
      server,
      MOCKED_USERS[0]._id,
      token,
    );

    expect(attendRes.data[attendOperation]).toEqual(true);
    expect(getPartyByIdRes.data.isAttender).toEqual(false);
    expect(getPartyByIdRes.data.attendersCount).toEqual(0);
    expect(getUserByIdRes.data.attendedPartiesCount).toEqual(0);
  });
});
