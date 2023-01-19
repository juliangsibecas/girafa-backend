import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppInfo, AppInfoDocument } from './schema';

@Injectable()
export class AppInfoService {
  constructor(
    @InjectModel(AppInfo.name)
    private appInfo: Model<AppInfoDocument>,
  ) {}

  initAppInfo() {
    return this.appInfo.create({ minVersion: '0.0.0' });
  }

  async getMinVersion() {
    const appInfo = await this.appInfo.findOne();

    return appInfo.minVersion;
  }

  setMinVersion(version: string) {
    return this.appInfo.findOneAndUpdate({}, { minVersion: version });
  }
}
