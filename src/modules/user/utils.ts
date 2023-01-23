import { Id } from 'src/common/types';
import { NotificationService } from '../notification';

import { PartyService } from '../party';

import { User, UserDocument } from './schema';
import { UserService } from './service';

export const userPreviewFields: Array<keyof User> = [
  '_id',
  'nickname',
  'fullName',
  'pictureId',
];

export const userDelete = ({
  user,
  userService,
  partyService,
  notificationsService,
}: {
  user: UserDocument;
  userService: UserService;
  partyService: PartyService;
  notificationsService: NotificationService;
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
    notificationsService.deleteByUser(user._id),
    user.remove(),
  ]);
