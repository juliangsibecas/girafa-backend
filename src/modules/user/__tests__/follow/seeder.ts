import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from '../../schema';
import { MOCKED_USERS } from '../../__mocks__/user';

@Injectable()
export class UserFollowSeeder {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}

  async run() {
    await Promise.all(MOCKED_USERS.map((user) => this.model.create(user)));
  }
}
