import { Injectable } from '@nestjs/common';

import { Seeder } from '../../../../common/utils';

import { UserService } from '../../service';

import { userChangeFollowingStateMocks } from './mocks';

@Injectable()
export class UserChangeFollowingStateSeeder extends Seeder {
  constructor(public users: UserService) {
    super();
  }

  async run() {
    super.run(this, userChangeFollowingStateMocks);
  }
}
