import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import { DbConfig, dbConfig } from './config';

export const mongooseModuleOptions: MongooseModuleAsyncOptions = {
  imports: [ConfigModule.forFeature(dbConfig)],
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const db: DbConfig = config.get('db');

    return {
      uri: `mongodb://${db.host}:${db.port}/${db.name}`,
    };
  },
};

export { dbConfig } from './config';
