import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationError } from 'apollo-server-express';
import { ILike, Repository } from 'typeorm';

import { Maybe } from '../../common/types';

import {
  UserChangeAttendingStateDto,
  UserChangeFollowingStateDto,
  UserCheckAvailabilityDto,
  UserCreateDto,
  UserGetByEmailDto,
  UserGetByIdDto,
  UserSetRecoveryCodeDto,
  UserSetRefreshTokenDto,
} from './dto';
import { User } from './schema';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private db: Repository<User>) {}

  async create(dto: UserCreateDto): Promise<User> {
    return this.db.save(dto);
  }

  async search(q: string): Promise<Array<User>> {
    const like = ILike(`%${q}%`);

    return this.db.find({
      where: [{ nickname: like }, { fullName: like }],
      select: ['id', 'nickname', 'fullName'],
      relations: ['following', 'followers'],
    });
  }

  async getById({
    id,
    select = [],
    relations = [],
  }: UserGetByIdDto): Promise<Maybe<User>> {
    return this.db.findOne({
      where: { id },
      select: ['id', ...select],
      relations,
    });
  }

  async getByEmail({ email, select }: UserGetByEmailDto): Promise<Maybe<User>> {
    return this.db.findOne({ where: { email }, select });
  }

  async addFollowing({ user, following }: UserChangeFollowingStateDto) {
    user.following.push(following);

    await this.db.save(user);
  }

  async removeFollowing({ user, following }: UserChangeFollowingStateDto) {
    await this.db.save({
      ...user,
      following: user.following.filter((followingUser) => {
        return followingUser.id !== following.id;
      }),
    });
  }

  async addAttending({ user, party }: UserChangeAttendingStateDto) {
    user.attendedParties.push(party);

    await this.db.save(user);
  }

  async removeAttending({ user, party }: UserChangeAttendingStateDto) {
    await this.db.save({
      ...user,
      attendedParties: user.attendedParties.filter((attendedParty) => {
        return attendedParty.id !== party.id;
      }),
    });
  }

  async checkAvailability({
    email,
    nickname,
  }: UserCheckAvailabilityDto): Promise<boolean> {
    const user = await this.db.findOne({ where: [{ email }, { nickname }] });

    if (!user) return true;

    throw new ValidationError(user.email === email ? 'email' : 'nickname');
  }

  async setRecoveryCode({ id, code }: UserSetRecoveryCodeDto): Promise<void> {
    await this.db.update(id, { recoveryCode: code });
  }

  async setRefreshToken({ id, token }: UserSetRefreshTokenDto): Promise<void> {
    await this.db.update(id, { refreshToken: token });
  }
}
