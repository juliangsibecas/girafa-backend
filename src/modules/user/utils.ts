import { Id } from 'src/common/types';

import { PartyService } from '../party';

import { UserDocument } from './schema';
import { UserService } from './service';

export const userDelete = ({
  user,
  userService,
  partyService,
}: {
  user: UserDocument;
  userService: UserService;
  partyService: PartyService;
}) =>
  Promise.all([
    Promise.all(
      (user.followers as Array<Id>).map(async (followerId) =>
        userService.unfollow({
          user: await userService.getById({ id: followerId }),
          following: user,
        }),
      ),
    ),
    Promise.all(
      (user.following as Array<Id>).map(async (followingId) =>
        userService.unfollow({
          user,
          following: await userService.getById({ id: followingId }),
        }),
      ),
    ),
    Promise.all(
      (user.organizedParties as Array<Id>).map(async (partyId) =>
        partyService.removeOrganizer({
          id: partyId,
        }),
      ),
    ),
    Promise.all(
      (user.attendedParties as Array<Id>).map(async (partyId) =>
        partyService.removeAttender({
          user,
          party: await partyService.getById({ id: partyId }),
        }),
      ),
    ),
    user.remove(),
  ]);
