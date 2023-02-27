import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mutation } from 'gql-query-builder';

import { AppModule } from '../../../../app';
import { ErrorCode } from '../../../../core/graphql';
import { TestSuite } from '../../../../common/utils';

import { PartyDeleteSeeder } from './seeder';
import { partyDeleteMocks } from './mocks';

describe('(E2E) Party - Delete', () => {
  let app: INestApplication;
  let seeder: PartyDeleteSeeder;
  let suite: TestSuite;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    seeder = module.get<PartyDeleteSeeder>(PartyDeleteSeeder);

    await seeder.run();

    app = module.createNestApplication();
    await app.init();

    suite = new TestSuite({ server: app.getHttpServer(), ...partyDeleteMocks });
    await suite.generateAccessTokens();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should delete', async () => {
    const deleteOperation = 'partyDelete';

    const deleteMutation = await suite.exec<{ [deleteOperation]: boolean }>(
      mutation({
        operation: deleteOperation,
        variables: {
          id: {
            type: `String`,
            required: true,
            value: suite.parties[0]._id,
          },
        },
      }),
    );

    const [sibeRes, gumpyRes, cosmoRes, guayraRes] = await Promise.all(
      [0, 1, 2, 3].map((idx) => suite.getUser(idx)),
    );

    const partyRes = await suite.getParty(0);

    const [
      sibeNotificationsRes,
      gumpyNotificationsRes,
      cosmoNotificationsRes,
      guayraNotificationsRes,
    ] = await Promise.all(
      [0, 1, 2, 3].map((idx) => suite.getNotificationsByUserId(idx)),
    );

    expect(deleteMutation.data[deleteOperation]).toEqual(true);
    expect(partyRes.errors[0].message).toEqual(ErrorCode.NOT_FOUND_ERROR);

    expect(sibeRes.data.attendedPartiesCount).toEqual(1);
    expect(gumpyRes.data.attendedPartiesCount).toEqual(2);
    expect(cosmoRes.data.attendedPartiesCount).toEqual(1);
    expect(guayraRes.data.attendedPartiesCount).toEqual(0);

    expect(sibeNotificationsRes.data.length).toEqual(0);
    expect(gumpyNotificationsRes.data.length).toEqual(2);
    expect(cosmoNotificationsRes.data.length).toEqual(0);
    expect(guayraNotificationsRes.data.length).toEqual(0);
  });
});
