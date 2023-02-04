import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';

import { ErrorDescription, ValidationError } from '../../core/graphql';
import { Id, Maybe } from '../../common/types';

import {
  PartyAddinvitedDto,
  PartyChangeAttendingStateDto,
  PartyCreateDto,
  PartyGetByIdDto,
  PartyGetBySlugDto,
  PartyRemoveOrganizerDto,
  PartySearchDto,
} from './dto';
import { PartyMapPreview, PartyPreview } from './response';
import { Party, PartyDocument } from './schema';
import { PartyAvailability, PartyStatus } from './types';

@Injectable()
export class PartyService {
  constructor(@InjectModel(Party.name) private model: Model<PartyDocument>) {}
  private readonly logger = new Logger(PartyService.name);

  async create(dto: PartyCreateDto): Promise<PartyDocument> {
    return this.model.create(dto);
  }

  async enable(id: Id): Promise<PartyDocument | undefined> {
    return this.model.findByIdAndUpdate(id, { status: PartyStatus.ENABLED });
  }

  async find({ userId }: PartySearchDto): Promise<Array<PartyMapPreview>> {
    const now = new Date();
    now.setHours(now.getHours() - 36);
    const select = ['_id', 'name', 'coordinate', 'date'];
    const organizerPopulate = {
      path: 'organizer',
      select: 'nickname',
    };

    const baseQuery: Partial<Party> = {
      status: PartyStatus.ENABLED,
    };

    const publics = await this.model
      .find(
        {
          ...baseQuery,
          availability: PartyAvailability.PUBLIC,
        },
        select,
      )
      .populate(organizerPopulate);

    const followersOnly = await this.model
      .find(
        {
          ...baseQuery,
          availability: PartyAvailability.FOLLOWERS,
        },
        select,
      )
      .populate([
        {
          ...organizerPopulate,
          match: {
            followers: userId,
          },
        },
        {
          ...organizerPopulate,
          match: {
            _id: userId,
          },
        },
      ]);

    const followingOnly = await this.model
      .find(
        {
          ...baseQuery,
          availability: PartyAvailability.FOLLOWING,
        },
        select,
      )
      .populate([
        {
          ...organizerPopulate,
          match: {
            following: userId,
          },
        },
        {
          ...organizerPopulate,
          match: {
            _id: userId,
          },
        },
      ]);

    const privates = await this.model
      .find(
        {
          ...baseQuery,
          availability: PartyAvailability.PRIVATE,
          $or: [
            {
              invited: userId,
            },
            {
              organizer: userId,
            },
          ],
        },
        select,
      )
      .populate(organizerPopulate);

    return [
      ...privates,
      ...followingOnly.filter((party) => party.organizer),
      ...followersOnly.filter((party) => party.organizer),
      ...publics,
    ].map((party) => ({
      ...party.toJSON(),
      organizerNickname: party.organizer?.nickname,
    }));
  }

  async search({ userId, q }: PartySearchDto): Promise<Array<PartyPreview>> {
    const select = ['_id', 'name'];
    const organizerPopulate = {
      path: 'organizer',
      select: 'nickname',
    };
    const nameLike = { name: { $regex: q, $options: 'i' } };

    const baseQuery = {
      status: {
        $in: [PartyStatus.ENABLED, PartyStatus.EXPIRED],
      },
    };

    const publics = await this.model
      .find(
        {
          ...baseQuery,
          ...nameLike,
          availability: PartyAvailability.PUBLIC,
        },
        select,
      )
      .populate(organizerPopulate);

    const followersOnly = await this.model
      .find(
        {
          ...baseQuery,
          ...nameLike,
          availability: PartyAvailability.FOLLOWERS,
        },
        select,
      )
      .populate({
        ...organizerPopulate,
        match: {
          followers: userId,
        },
      });

    const followingOnly = await this.model
      .find(
        {
          ...baseQuery,
          ...nameLike,
          availability: PartyAvailability.FOLLOWING,
        },
        select,
      )
      .populate({
        ...organizerPopulate,
        match: {
          following: userId,
        },
      });

    const privates = await this.model
      .find(
        {
          ...baseQuery,
          ...nameLike,
          availability: PartyAvailability.PRIVATE,
          invited: userId,
        },
        select,
      )
      .populate(organizerPopulate);

    return [
      ...privates,
      ...followingOnly.filter((party) => party.organizer),
      ...followersOnly.filter((party) => party.organizer),
      ...publics,
    ].map((party) => ({
      ...party.toJSON(),
      organizerNickname: party.organizer?.nickname,
    }));
  }

  async getById({
    id,
    select = [],
    relations = [],
  }: PartyGetByIdDto): Promise<Maybe<PartyDocument>> {
    return this.model.findOne({ _id: id }, select).populate(relations);
  }

  async getBySlug({
    slug,
    select = [],
    relations = [],
  }: PartyGetBySlugDto): Promise<Maybe<PartyDocument>> {
    return this.model.findOne({ slug: slug }, select).populate(relations);
  }

  async checkAvailability(name: string): Promise<void> {
    const party = await this.model.findOne({ name });

    if (!party) return;

    throw new ValidationError({
      name: ErrorDescription.PARTY_NAME_NOT_AVAILABLE,
    });
  }

  async addAttender({ user, party }: PartyChangeAttendingStateDto) {
    if (!party.attenders.includes(user._id)) {
      await party.updateOne({
        $addToSet: { attenders: user._id },
        $inc: { attendersCount: 1 },
      });
    }
  }

  async removeAttender({ user, party }: PartyChangeAttendingStateDto) {
    if (party.attenders.includes(user._id)) {
      await party.updateOne({
        $pull: { attenders: user._id },
        $inc: { attendersCount: -1 },
      });
    }
  }

  async addInvited({ invitedId, party }: PartyAddinvitedDto) {
    await party.updateOne({
      $addToSet: { invited: { $each: invitedId } },
    });
  }

  async removeOrganizer({ id }: PartyRemoveOrganizerDto) {
    return this.model.findByIdAndUpdate(id, { organizer: null });
  }

  async userCanAttend({ user, party }: PartyChangeAttendingStateDto) {
    const isPublic = party.availability === PartyAvailability.PUBLIC;
    if (isPublic) return true;

    const isFollower =
      party.availability === PartyAvailability.FOLLOWERS &&
      (party.organizer.followers as Array<Id>).find(
        (id: Id) => id === user._id,
      );
    if (isFollower) return true;

    const isFollowing =
      party.availability === PartyAvailability.FOLLOWING &&
      (party.organizer.following as Array<Id>).find(
        (id: Id) => id === user._id,
      );
    if (isFollowing) return true;

    const isPrivate =
      party.availability === PartyAvailability.PRIVATE &&
      (party.invited as Array<Id>).find((id: Id) => id === user._id);
    if (isPrivate) return true;

    const isOrganizer = party.organizer._id === user._id;
    if (isOrganizer) return true;

    return false;
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async _handleExpires() {
    const date = new Date();
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    date.setDate(7);
    date.setHours(0, 0, 0, 0);

    const res = await this.model.updateMany(
      {
        date: new Date(date.getTime() - userTimezoneOffset),
      },
      {
        status: PartyStatus.EXPIRED,
      },
    );

    this.logger.log(res);
  }

  //
  // ADMIN
  //
  async getCount(): Promise<number> {
    return this.model.count();
  }

  async getCreatedCount(): Promise<number> {
    return this.model.count({ status: PartyStatus.CREATED });
  }
}
