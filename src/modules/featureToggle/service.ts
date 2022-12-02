import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeatureToggleChangeValueDto, FeatureTogglePopulateDto } from './dto';

import { FeatureToggle, FeatureToggleDocument } from './schema';
import { FeatureToggleName } from './types';

@Injectable()
export class FeatureToggleService {
  constructor(
    @InjectModel(FeatureToggle.name)
    private featureToggles: Model<FeatureToggleDocument>,
  ) {}

  list() {
    return this.featureToggles.find();
  }

  async getEnabledNames() {
    const fts = await this.featureToggles.find({ value: true });

    return fts.map(({ name }) => name);
  }

  populate(dto: FeatureTogglePopulateDto) {
    return Promise.all(
      Object.keys(FeatureToggleName).map((name) =>
        this.featureToggles.findOneAndUpdate(
          { name },
          dto.value == undefined ? {} : { value: dto.value },
          { upsert: true },
        ),
      ),
    );
  }

  clear() {
    return this.featureToggles.deleteMany({
      name: {
        $nin: Object.keys(FeatureToggleName),
      },
    });
  }

  changeValue(dto: FeatureToggleChangeValueDto) {
    return this.featureToggles.findOneAndUpdate(
      { name: dto.name },
      { value: dto.value },
    );
  }

  async check(name: FeatureToggleName) {
    const ft = await this.featureToggles.findOne({
      name,
    });

    return ft.value;
  }

  async checkMany(names: Array<FeatureToggleName>) {
    const ft = await this.featureToggles.findOne({
      name: {
        $in: names,
      },
      value: false,
    });

    return !ft;
  }
}
