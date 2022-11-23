import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Environment } from '../../common/types';
import { DbConfig, dbConfig } from './config';

let mongod: MongoMemoryServer;

export const mongooseModuleOptions: MongooseModuleAsyncOptions = {
  imports: [ConfigModule.forFeature(dbConfig)],
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    if (process.env.NODE_ENV === Environment.TEST) {
      mongod = await MongoMemoryServer.create();
      return {
        uri: mongod.getUri(),
      };
    }

    const db: DbConfig = config.get('db');

    if (db.user && db.password) {
      return {
        uri: `mongodb://${db.user}:${db.password}@${db.host}:${db.port}/${db.name}`,
      };
    }

    return {
      uri: `mongodb://${db.host}:${db.port}/${db.name}`,
    };
  },
};

export const closeMongodConnection = async () => {
  if (mongod) await mongod.stop();
};

export { dbConfig } from './config';
