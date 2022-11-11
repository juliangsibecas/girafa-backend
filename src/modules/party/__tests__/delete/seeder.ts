import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { Seeder } from '../../../../common/utils';
import { UserService } from '../../../../modules/user';
import { NotificationService } from '../../../../modules/notification';

import { PartyService } from '../../service';

import { partyDeleteMocks } from './mocks';

@Injectable()
export class PartyDeleteSeeder extends Seeder {
  constructor(
    public parties: PartyService,
    @Inject(forwardRef(() => UserService))
    public users: UserService,
    @Inject(forwardRef(() => NotificationService))
    public notifications: NotificationService,
  ) {
    super();
  }

  async run() {
    super.run(this, partyDeleteMocks);
  }
}
