import { Entities, EntitiesServices } from '../../common/types';

import { UserCreateDto } from '../../modules/user/dto';

export class Seeder {
  async run(services: Partial<EntitiesServices>, mocks: Partial<Entities>) {
    await Promise.all([
      Promise.all(
        (mocks.users ?? []).map((user) =>
          services.users.create(user as UserCreateDto),
        ),
      ),
      Promise.all(
        (mocks.parties ?? []).map((party) => services.parties.create(party)),
      ),
      Promise.all(
        (mocks.notifications ?? []).map((notification) =>
          services.notifications.create(notification),
        ),
      ),
    ]);
  }
}
