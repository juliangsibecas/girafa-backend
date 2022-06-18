import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ValidationError } from 'apollo-server-express';
import { Model } from 'mongoose';

import { Id, Maybe } from '../../common/types';

import {
  PartyAddinvitedDto,
  PartyChangeAttendingStateDto,
  PartyCreateDto,
  PartyGetByIdDto,
  PartySearchDto,
} from './dto';
import { Party, PartyDocument } from './schema';
import { PartyAvailability } from './types';

@Injectable()
export class PartyService {
  constructor(@InjectModel(Party.name) private model: Model<PartyDocument>) {}

  async create(dto: PartyCreateDto): Promise<PartyDocument> {
    return this.model.create(dto);
  }

  async search({ userId, q }: PartySearchDto): Promise<Array<Party>> {
    const publics = await this.model
      .find({
        availability: PartyAvailability.PUBLIC,
      })
      .populate('organizer');

    const followersOnly = await this.model
      .find({
        availability: PartyAvailability.FOLLOWERS,
      })
      .populate({
        path: 'organizer',
        match: {
          followers: userId,
        },
        select: '_id',
      });

    const followingOnly = await this.model
      .find({
        availability: PartyAvailability.FOLLOWING,
      })
      .populate({
        path: 'organizer',
        match: {
          following: userId,
        },
        select: '_id',
      });

    const privates = await this.model
      .find({
        availability: PartyAvailability.PRIVATE,
        invited: userId,
      })
      .populate('organizer');

    return [
      ...privates,
      ...followingOnly.filter((party) => party.organizer),
      ...followersOnly.filter((party) => party.organizer),
      ...publics,
    ];
  }

  async getById({
    id,
    select = [],
    relations = [],
  }: PartyGetByIdDto): Promise<Maybe<PartyDocument>> {
    return this.model.findOne({ _id: id }, select).populate(relations);
  }

  async checkAvailability(name: string): Promise<void> {
    const party = await this.model.findOne({ name });

    if (!party) return;

    throw new ValidationError('name');
  }

  async addAttender({ user, party }: PartyChangeAttendingStateDto) {
    await party.updateOne({
      $addToSet: { attenders: user._id },
      $inc: { attendersCount: 1 },
    });
  }

  async removeAttender({ user, party }: PartyChangeAttendingStateDto) {
    await party.updateOne({
      $pull: { attenders: user._id },
      $inc: { attendersCount: -1 },
    });
  }

  async addInvited({ user, party }: PartyAddinvitedDto) {
    await party.updateOne({
      $addToSet: { invited: user._id },
    });
  }

  async userCanAttend({ user, party }: PartyChangeAttendingStateDto) {
    const isPublic = party.availability === PartyAvailability.PUBLIC;
    const isFollower =
      party.availability === PartyAvailability.FOLLOWERS &&
      (party.organizer.followers as unknown as Array<Id>).find((id: Id) =>
        id.equals(user._id),
      );
    const isFollowing =
      party.availability === PartyAvailability.FOLLOWING &&
      (party.organizer.following as unknown as Array<Id>).find((id: Id) =>
        id.equals(user._id),
      );
    const isPrivate =
      party.availability === PartyAvailability.PRIVATE &&
      (party.invited as unknown as Array<Id>).find((id: Id) =>
        id.equals(user._id),
      );

    return isPublic || isFollower || isFollowing || isPrivate;
  }
}
