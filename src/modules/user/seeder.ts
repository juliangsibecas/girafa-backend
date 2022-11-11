import { UserChangeAttendingStateSeeder } from './__tests__/attend/seeder';
import { UserDeleteSeeder } from './__tests__/delete/seeder';
import { UserChangeFollowingStateSeeder } from './__tests__/follow/seeder';

export const seeders = [
  UserDeleteSeeder,
  UserChangeAttendingStateSeeder,
  UserChangeFollowingStateSeeder,
];
