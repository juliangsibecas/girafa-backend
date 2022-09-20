import * as bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import { User } from '../schema';

export const mockUser = (
  data: Pick<User, 'email' | 'nickname' | 'fullName'>,
): User => ({
  _id: v4(),
  following: [],
  followingCount: 0,
  followers: [],
  followersCount: 0,
  attendedParties: [],
  attendedPartiesCount: 0,
  createdAt: new Date(),
  invites: [],
  notifications: [],
  password: bcrypt.hashSync('1234', 1),
  ...data,
});

export const MOCKED_USERS = [
  mockUser({
    email: 'juliangsibecas@gmail.com',
    nickname: 'juliangsibecas',
    fullName: 'Julian Gomez Sibecas',
  }),
  mockUser({
    email: 'gumpy@gmail.com',
    nickname: 'gumpy',
    fullName: 'Forest Gump',
  }),
  mockUser({
    email: 'cosmo@gmail.com',
    nickname: 'cosmo',
    fullName: 'Cosmo',
  }),
  mockUser({
    email: 'guayra@gmail.com',
    nickname: 'guarya',
    fullName: 'Guayra',
  }),
];
