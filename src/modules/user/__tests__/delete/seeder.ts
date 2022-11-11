import { Injectable } from '@nestjs/common';

import { Seeder } from '../../../../common/utils';
import { PartyService } from '../../../../modules/party';

import { UserService } from '../../service';
import { userDeleteMocks } from './mocks';

@Injectable()
export class UserDeleteSeeder extends Seeder {
  constructor(public users: UserService, public parties: PartyService) {
    super();
  }

  async run() {
    super.run(this, userDeleteMocks);
  }
}
