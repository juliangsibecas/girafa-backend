import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mutation } from 'gql-query-builder';

import { AppModule } from '../../../../app';
import { ErrorCodes, gql } from '../../../../core/graphql';
import { getUserById, signIn } from '../../../../common/utils';

import { UserChangeFollowingStateInput } from '../../input';
import { MOCKED_USERS } from '../../__mocks__/user';

import { UserFollowSeeder } from './seeder';

describe('(E2E) User - Follow', () => {
  let app: INestApplication;
  let server: any;
  let seeder: UserFollowSeeder;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    seeder = module.get<UserFollowSeeder>(UserFollowSeeder);

    await seeder.run();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should follow', async () => {
    const followOperation = 'userChangeFollowingState';

    const signInRes = await signIn(server, 'juliangsibecas@gmail.com');
    const token = signInRes.data.accessToken;

    const followRes = await gql<{ [followOperation]: boolean }>(
      server,
      mutation({
        operation: followOperation,
        variables: {
          data: {
            type: `UserChangeFollowingStateInput`,
            required: true,
            value: {
              followingId: MOCKED_USERS[1]._id,
              state: true,
            } as UserChangeFollowingStateInput,
          },
        },
      }),
      token,
    );

    const getByIdRes = await getUserById(server, MOCKED_USERS[1]._id, token);

    expect(followRes.data[followOperation]).toEqual(true);
    expect(getByIdRes.data.isFollowing).toEqual(true);
  });

  it('should not follow itself', async () => {
    const followOperation = 'userChangeFollowingState';

    const signInRes = await signIn(server, 'juliangsibecas@gmail.com');
    const token = signInRes.data.accessToken;

    const follow = await gql<{ [followOperation]: boolean }>(
      server,
      mutation({
        operation: followOperation,
        variables: {
          data: {
            type: `UserChangeFollowingStateInput`,
            required: true,
            value: {
              followingId: MOCKED_USERS[0]._id,
              state: true,
            } as UserChangeFollowingStateInput,
          },
        },
      }),
      token,
    );

    expect(follow.errors[0].message).toEqual(ErrorCodes.UNKNOWN_ERROR);
  });

  it('should unfollow', async () => {
    const followOperation = 'userChangeFollowingState';

    const signInRes = await signIn(server, 'juliangsibecas@gmail.com');
    const token = signInRes.data.accessToken;

    const follow = await gql<{ [followOperation]: boolean }>(
      app.getHttpServer(),
      mutation({
        operation: followOperation,
        variables: {
          data: {
            type: `UserChangeFollowingStateInput`,
            required: true,
            value: {
              followingId: MOCKED_USERS[1]._id,
              state: false,
            } as UserChangeFollowingStateInput,
          },
        },
      }),
      token,
    );

    const getByIdRes = await getUserById(server, MOCKED_USERS[1]._id, token);

    expect(follow.data[followOperation]).toEqual(true);
    expect(getByIdRes.data.isFollowing).toEqual(false);
  });
});
