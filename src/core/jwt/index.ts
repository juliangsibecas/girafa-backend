import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import { jwtConfig } from './config';

export const jwtModuleOptions: JwtModuleAsyncOptions = {
  imports: [ConfigModule.forFeature(jwtConfig)],
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => ({
    secret: config.get('jwt.accessToken.secret'),
  }),
};

export { jwtConfig };
