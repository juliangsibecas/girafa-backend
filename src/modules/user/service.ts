import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { insertObjectIf } from 'src/common/utils';
import { ValidationError } from 'src/core/graphql';

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
  UserSetPasswordDto,
  UserEditDto,
} from './dto';
import { User, UserDocument } from './schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}

  async create(dto: UserCreateDto): Promise<User> {
    return this.model.create(dto);
  }

  async edit(dto: UserEditDto): Promise<User> {
    return this.model.findByIdAndUpdate(dto.id, dto);
  }

  async search(q: string): Promise<Array<User>> {
    const like = { $regex: q, $options: 'i' };

    return this.model.find(
      {
        $or: [{ nickname: like }, { fullName: like }],
      },
      ['_id', 'nickname', 'fullName'],
    );
  }

  async getById({
    id,
    select = [],
    relations = [],
  }: UserGetByIdDto): Promise<Maybe<UserDocument>> {
    return this.model.findOne({ _id: id }, select).populate(relations);
  }

  async getByEmail({
    email,
    select,
  }: UserGetByEmailDto): Promise<Maybe<UserDocument>> {
    return this.model.findOne({ email }, select);
  }

  async follow({ user, following }: UserChangeFollowingStateDto) {
    if (!user.following.includes(following._id)) {
      await user.updateOne({
        $addToSet: { following: following._id },
        $inc: { followingCount: 1 },
      });

      await following.updateOne({
        $addToSet: { followers: user._id },
        $inc: { followersCount: 1 },
      });
    }
  }

  async unfollow({ user, following }: UserChangeFollowingStateDto) {
    if (user.following.includes(following._id)) {
      await user.updateOne({
        $pull: { following: following._id },
        $inc: { followingCount: -1 },
      });

      await following.updateOne({
        $pull: { followers: user._id },
        $inc: { followersCount: -1 },
      });
    }
  }

  async attend({ user, party }: UserChangeAttendingStateDto) {
    if (!user.attendedParties.includes(party._id)) {
      await user.updateOne({
        $addToSet: { attendedParties: party._id },
        $inc: { attendedPartiesCount: 1 },
      });
    }
  }

  async unattend({ user, party }: UserChangeAttendingStateDto) {
    if (user.attendedParties.includes(party._id)) {
      await user.updateOne({
        $pull: { attendedParties: party._id },
        $inc: { attendedPartiesCount: -1 },
      });
    }
  }

  async checkAvailability({
    email,
    nickname,
  }: UserCheckAvailabilityDto): Promise<boolean> {
    const sameEmail = Boolean(await this.model.findOne({ email }));
    const sameNickname = Boolean(await this.model.findOne({ nickname }));

    if (!sameEmail && !sameNickname) return true;

    throw new ValidationError({
      ...insertObjectIf(sameEmail, {
        email: 'El correo electrónico ya esta en uso.',
      }),
      ...insertObjectIf(sameNickname, {
        nickname: 'El nombre de usuario ya esta en uso.',
      }),
    });
  }

  async setRecoveryCode({ id, code }: UserSetRecoveryCodeDto): Promise<void> {
    await this.model.findByIdAndUpdate(id, { recoveryCode: code });
  }

  async setPassword({ id, password }: UserSetPasswordDto): Promise<void> {
    await this.model.findByIdAndUpdate(id, {
      password: password,
      recoveryCode: null,
    });
  }

  async setRefreshToken({ id, token }: UserSetRefreshTokenDto): Promise<void> {
    await this.model.findByIdAndUpdate(id, { refreshToken: token });
  }
}
