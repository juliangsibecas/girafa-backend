import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mutation } from 'gql-query-builder';

import { AppModule } from '../../../../app';
import { ErrorCode } from '../../../../core/graphql';
import { TestSuite } from '../../../../common/utils';

import { UserChangeFollowingStateInput } from '../../input';

import { UserChangeFollowingStateSeeder } from './seeder';
import { userChangeFollowingStateMocks } from './mocks';

describe('(E2E) User - Follow', () => {
  let app: INestApplication;
  let seeder: UserChangeFollowingStateSeeder;
  let suite: TestSuite;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    seeder = module.get<UserChangeFollowingStateSeeder>(
      UserChangeFollowingStateSeeder,
    );

    await seeder.run();

    app = module.createNestApplication();
    await app.init();

    suite = new TestSuite({
      server: app.getHttpServer(),
      ...userChangeFollowingStateMocks,
    });

    await suite.generateAccessTokens();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should follow', async () => {
    const followOperation = 'userChangeFollowingState';

    const followRes = await suite.exec<{ [followOperation]: boolean }>(
      mutation({
        operation: followOperation,
        variables: {
          data: {
            type: `UserChangeFollowingStateInput`,
            required: true,
            value: {
              followingId: suite.users[1]._id,
              state: true,
            } as UserChangeFollowingStateInput,
          },
        },
      }),
    );

    const getUserRes = await suite.getUser(0);
    const getFollowedByIdRes = await suite.getUser(1);

    expect(followRes.data[followOperation]).toEqual(true);
    expect(getUserRes.data.followingCount).toEqual(1);
    expect(getFollowedByIdRes.data.isFollowing).toEqual(true);
    expect(getFollowedByIdRes.data.followersCount).toEqual(1);
  });

  it('should not follow itself', async () => {
    const followOperation = 'userChangeFollowingState';

    const followRes = await suite.exec<{ [followOperation]: boolean }>(
      mutation({
        operation: followOperation,
        variables: {
          data: {
            type: `UserChangeFollowingStateInput`,
            required: true,
            value: {
              followingId: suite.users[0]._id,
              state: true,
            } as UserChangeFollowingStateInput,
          },
        },
      }),
    );

    expect(followRes.errors[0].message).toEqual(ErrorCode.UNKNOWN_ERROR);
  });

  it('should unfollow', async () => {
    const followOperation = 'userChangeFollowingState';

    const followRes = await suite.exec<{ [followOperation]: boolean }>(
      mutation({
        operation: followOperation,
        variables: {
          data: {
            type: `UserChangeFollowingStateInput`,
            required: true,
            value: {
              followingId: suite.users[1]._id,
              state: false,
            } as UserChangeFollowingStateInput,
          },
        },
      }),
    );

    const getUserRes = await suite.getUser(0);
    const getFollowedByIdRes = await suite.getUser(1);

    expect(followRes.data[followOperation]).toEqual(true);
    expect(getUserRes.data.followingCount).toEqual(0);
    expect(getFollowedByIdRes.data.isFollowing).toEqual(false);
    expect(getFollowedByIdRes.data.followersCount).toEqual(0);
  });
});
