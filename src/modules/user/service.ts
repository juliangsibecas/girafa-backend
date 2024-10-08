import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ErrorDescription, ValidationError } from '../../core/graphql';
import { GroupedCount, Maybe, Pagination } from '../../common/types';

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
  UserAddOrganizedPartyDto,
  UserSearchDto,
  UserGetByNicknameDto,
  UserRemoveOrganizedPartyDto,
  UserAddChatDto,
} from './dto';
import { User, UserDocument } from './schema';
import { userPreviewFields } from './utils';
import { UserPreview } from './response';
import { Chat } from '../chat';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}

  async create(dto: UserCreateDto): Promise<UserDocument> {
    return this.model.create(dto);
  }

  async edit(dto: UserEditDto): Promise<UserDocument> {
    return this.model.findByIdAndUpdate(dto.id, dto);
  }

  async search(dto: UserSearchDto): Promise<Array<UserDocument>> {
    const like = { $regex: dto.search, $options: 'i' };

    return this.model.find(
      {
        _id: {
          $ne: dto.id,
        },
        $or: [{ nickname: like }, { fullName: like }],
      },
      ['_id', 'nickname', 'fullName', 'pictureId'],
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

  async getByNickname({
    nickname,
    select = [],
    relations = [],
  }: UserGetByNicknameDto): Promise<Maybe<UserDocument>> {
    return this.model.findOne({ nickname }, select).populate(relations);
  }

  async getOpera(): Promise<Array<UserDocument>> {
    return this.model.find({ isOpera: true }, ['attendedParties'] as Array<
      keyof User
    >);
  }

  async follow({ user, following }: UserChangeFollowingStateDto) {
    if (!user.following.includes(following._id)) {
      await user.updateOne({
        $addToSet: { following: following._id },
      });

      await following.updateOne({
        $addToSet: { followers: user._id },
      });
    }
  }

  async unfollow({ user, following }: UserChangeFollowingStateDto) {
    if (user.following.includes(following._id)) {
      await user.updateOne({
        $pull: { following: following._id },
      });

      await following.updateOne({
        $pull: { followers: user._id },
      });
    }
  }

  async addOrganizedParty({ user, party }: UserAddOrganizedPartyDto) {
    if (!user.organizedParties.includes(party._id)) {
      await user.updateOne({
        $addToSet: { organizedParties: party._id },
      });
    }
  }

  async removeOrganizedParty({ user, party }: UserRemoveOrganizedPartyDto) {
    if (user.organizedParties.includes(party._id)) {
      await user.updateOne({
        $pull: { organizedParties: party._id },
      });
    }
  }

  async attend({ user, party }: UserChangeAttendingStateDto) {
    if (!user.attendedParties.includes(party._id)) {
      await user.updateOne({
        $addToSet: { attendedParties: party._id },
      });
    }
  }

  async unattend({ user, party }: UserChangeAttendingStateDto) {
    if (user.attendedParties.includes(party._id)) {
      await user.updateOne({
        $pull: { attendedParties: party._id },
      });
    }
  }

  async checkNicknameAvailability(nickname: string): Promise<boolean> {
    const sameNickname = Boolean(await this.model.findOne({ nickname }));

    if (!sameNickname) return true;

    throw new ValidationError({
      nickname: ErrorDescription.USER_NAME_NOT_AVAILABLE,
    });
  }

  async checkEmailAvailability(email: string): Promise<boolean> {
    const sameEmail = Boolean(await this.model.findOne({ email }));

    if (!sameEmail) return true;

    throw new ValidationError({
      email: ErrorDescription.EMAIL_NOT_AVAILABLE,
    });
  }

  async checkAvailability({
    email,
    nickname,
  }: UserCheckAvailabilityDto): Promise<void> {
    await this.checkEmailAvailability(email);
    await this.checkNicknameAvailability(nickname);
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

  async addChat({ user, chatId }: UserAddChatDto) {
    if (!(user.chats as Array<Chat>).find(({ _id }) => _id === chatId)) {
      await user.updateOne({
        $addToSet: { chats: chatId },
      });
    }
  }

  //
  // ADMIN
  //

  async list({ offset, limit }: Pagination): Promise<Array<UserPreview>> {
    return this.model.find({}, userPreviewFields).skip(offset).limit(limit);
  }

  async getCount(): Promise<number> {
    return this.model.count();
  }

  async getCreatedByDayCount(): Promise<Array<GroupedCount>> {
    return this.model.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%d-%m-%Y', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);
  }
}
