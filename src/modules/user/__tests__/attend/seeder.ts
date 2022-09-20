import { Injectable } from '@nestjs/common';

import { PartyService } from '../../../../modules/party';
import { MOCKED_PARTIES } from '../../../../modules/party/__mocks__/party';
import { UserCreateDto } from '../../dto';

import { UserService } from '../../service';
import { MOCKED_USERS } from '../../__mocks__/user';

@Injectable()
export class UserAttendSeeder {
  constructor(private users: UserService, private parties: PartyService) {}

  async run() {
    await Promise.all([
      Promise.all(
        MOCKED_USERS.map((user) => this.users.create(user as UserCreateDto)),
      ),
      this.parties.create(MOCKED_PARTIES[0]),
    ]);
  }
}
