import { Injectable } from '@nestjs/common';

import { Seeder } from '../../../../common/utils';
import { PartyService } from '../../../../modules/party';

import { UserService } from '../../service';
import { userChangeAttendingStateMocks } from './mocks';

@Injectable()
export class UserChangeAttendingStateSeeder extends Seeder {
  constructor(public users: UserService, public parties: PartyService) {
    super();
  }

  async run() {
    super.run(this, userChangeAttendingStateMocks);
  }
}
