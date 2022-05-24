import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Environment } from 'src/common/types';
import { DbConfig, dbConfig } from './config';

export const typeormModuleOptions: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule.forFeature(dbConfig)],
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const env: Environment = config.get('app.env');
    const db: DbConfig = config.get('db');

    return {
      type: 'postgres',
      host: db.host,
      port: db.port,
      username: db.user,
      password: db.password,
      database: db.name,
      synchronize: env !== Environment.PRODUCTION,
      dropSchema: env === Environment.TEST,
      autoLoadEntities: true,
      namingStrategy: new SnakeNamingStrategy(),
    };
  },
};

export { dbConfig } from './config';
