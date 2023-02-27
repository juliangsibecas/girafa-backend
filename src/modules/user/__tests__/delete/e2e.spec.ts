import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mutation } from 'gql-query-builder';

import { TestSuite } from '../../../../common/utils';
import { AppModule } from '../../../../app';
import { ErrorCode } from '../../../../core/graphql';

import { UserDeleteSeeder } from './seeder';
import { userDeleteMocks } from './mocks';

describe('(E2E) User - Delete', () => {
  let app: INestApplication;
  let seeder: UserDeleteSeeder;
  let suite: TestSuite;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    seeder = module.get<UserDeleteSeeder>(UserDeleteSeeder);

    await seeder.run();

    app = module.createNestApplication();
    await app.init();

    suite = new TestSuite({ server: app.getHttpServer(), ...userDeleteMocks });
    await suite.generateAccessTokens();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should delete', async () => {
    const deleteOperation = 'userDelete';

    const deleteRes = await suite.exec<{ [deleteOperation]: boolean }>(
      mutation({
        operation: deleteOperation,
      }),
    );

    const [sibeRes, gumpyRes, cosmoRes, guayraRes] = await Promise.all(
      [0, 1, 2, 3].map((idx) => suite.getUser(idx)),
    );

    const partyRes = await suite.getParty(0, 1);

    const signInAfterDeleteRes = await suite.signIn('juliangsibecas@gmail.com');

    expect(deleteRes.data[deleteOperation]).toEqual(true);
    expect(sibeRes.errors[0].message).toEqual(ErrorCode.NOT_FOUND_ERROR);
    expect(gumpyRes.data.followersCount).toEqual(0);
    expect(gumpyRes.data.followingCount).toEqual(0);
    expect(cosmoRes.data.followingCount).toEqual(1);
    expect(cosmoRes.data.followersCount).toEqual(1);
    expect(guayraRes.data.followingCount).toEqual(1);
    expect(guayraRes.data.followersCount).toEqual(1);
    expect(partyRes.data.attendersCount).toEqual(1);
    expect(signInAfterDeleteRes.errors[0].message).toEqual(
      ErrorCode.VALIDATION_ERROR,
    );
  });
});
