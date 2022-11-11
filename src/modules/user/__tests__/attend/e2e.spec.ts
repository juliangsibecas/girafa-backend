import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mutation } from 'gql-query-builder';

import { TestSuite } from '../../../../common/utils';
import { AppModule } from '../../../../app';

import { UserChangeAttendingStateInput } from '../../input';

import { userChangeAttendingStateMocks } from './mocks';
import { UserChangeAttendingStateSeeder } from './seeder';

describe('(E2E) User - Attend', () => {
  let app: INestApplication;
  let seeder: UserChangeAttendingStateSeeder;
  let suite: TestSuite;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    seeder = module.get<UserChangeAttendingStateSeeder>(
      UserChangeAttendingStateSeeder,
    );

    await seeder.run();

    app = module.createNestApplication();
    await app.init();

    suite = new TestSuite({
      server: app.getHttpServer(),
      ...userChangeAttendingStateMocks,
    });
    await suite.generateAccessTokens();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should attend', async () => {
    const attendOperation = 'userChangeAttendingState';

    const attendRes = await suite.exec<{ [attendOperation]: boolean }>(
      mutation({
        operation: attendOperation,
        variables: {
          data: {
            type: `UserChangeAttendingStateInput`,
            required: true,
            value: {
              partyId: suite.parties[0]._id,
              state: true,
            } as UserChangeAttendingStateInput,
          },
        },
      }),
    );

    const getPartyByIdRes = await suite.getPartyById(0);
    const getUserByIdRes = await suite.getUserById(0);

    expect(attendRes.data[attendOperation]).toEqual(true);
    expect(getPartyByIdRes.data.isAttender).toEqual(true);
    expect(getPartyByIdRes.data.attendersCount).toEqual(1);
    expect(getUserByIdRes.data.attendedPartiesCount).toEqual(1);
  });

  it('should unattend', async () => {
    const attendOperation = 'userChangeAttendingState';

    const attendRes = await suite.exec<{ [attendOperation]: boolean }>(
      mutation({
        operation: attendOperation,
        variables: {
          data: {
            type: `UserChangeAttendingStateInput`,
            required: true,
            value: {
              partyId: suite.parties[0]._id,
              state: false,
            } as UserChangeAttendingStateInput,
          },
        },
      }),
    );

    const getPartyByIdRes = await suite.getPartyById(0);
    const getUserByIdRes = await suite.getUserById(0);

    expect(attendRes.data[attendOperation]).toEqual(true);
    expect(getPartyByIdRes.data.isAttender).toEqual(false);
    expect(getPartyByIdRes.data.attendersCount).toEqual(0);
    expect(getUserByIdRes.data.attendedPartiesCount).toEqual(0);
  });

  it('should not unattend an unatteded party', async () => {
    const attendOperation = 'userChangeAttendingState';

    const attendRes = await suite.exec<{ [attendOperation]: boolean }>(
      mutation({
        operation: attendOperation,
        variables: {
          data: {
            type: `UserChangeAttendingStateInput`,
            required: true,
            value: {
              partyId: suite.parties[0]._id,
              state: false,
            } as UserChangeAttendingStateInput,
          },
        },
      }),
    );

    const getPartyByIdRes = await suite.getPartyById(0);
    const getUserByIdRes = await suite.getUserById(0);

    expect(attendRes.data[attendOperation]).toEqual(true);
    expect(getPartyByIdRes.data.isAttender).toEqual(false);
    expect(getPartyByIdRes.data.attendersCount).toEqual(0);
    expect(getUserByIdRes.data.attendedPartiesCount).toEqual(0);
  });
});
