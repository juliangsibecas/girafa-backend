import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mutation } from 'gql-query-builder';

import { AppModule } from '../../../../app';
import { ErrorCodes, gql } from '../../../../core/graphql';
import { getPartyById, getUserById, signIn } from '../../../../common/utils';
import { MOCKED_PARTIES } from '../../../../modules/party/__mocks__/party';

import { UserDeleteSeeder } from './seeder';
import { MOCKED_USERS } from '../../__mocks__/user';

describe('(E2E) User - Delete', () => {
  let app: INestApplication;
  let server: any;
  let seeder: UserDeleteSeeder;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    seeder = module.get<UserDeleteSeeder>(UserDeleteSeeder);

    await seeder.run();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should delete', async () => {
    const deleteOperation = 'userDelete';

    const signInRes = await signIn(server, 'juliangsibecas@gmail.com');
    const deleteMutation = await gql<{ [deleteOperation]: boolean }>(
      server,
      mutation({
        operation: deleteOperation,
      }),
      signInRes.data.accessToken,
    );

    const gumpySignInRes = await signIn(server, 'gumpy@gmail.com');
    const token = gumpySignInRes.data.accessToken;

    const sibeRes = await getUserById(server, MOCKED_USERS[0]._id, token);
    const gumpyRes = await getUserById(server, MOCKED_USERS[1]._id, token);
    const cosmoRes = await getUserById(server, MOCKED_USERS[2]._id, token);
    const guayraRes = await getUserById(server, MOCKED_USERS[3]._id, token);
    const partyRes = await getPartyById(server, MOCKED_PARTIES[0]._id, token);

    const signInAfterDeleteRes = await signIn(
      server,
      'juliangsibecas@gmail.com',
    );

    expect(deleteMutation.data[deleteOperation]).toEqual(true);
    expect(sibeRes.errors[0].message).toEqual(ErrorCodes.NOT_FOUND_ERROR);
    expect(gumpyRes.data.followersCount).toEqual(0);
    expect(gumpyRes.data.followingCount).toEqual(0);
    expect(cosmoRes.data.followingCount).toEqual(1);
    expect(cosmoRes.data.followersCount).toEqual(1);
    expect(guayraRes.data.followingCount).toEqual(1);
    expect(guayraRes.data.followersCount).toEqual(1);
    expect(partyRes.data.attendersCount).toEqual(1);
    expect(signInAfterDeleteRes.errors[0].message).toEqual(
      ErrorCodes.VALIDATION_ERROR,
    );
  });
});
