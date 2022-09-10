import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { jwtModuleOptions } from '../../core/jwt';

import { UserModule } from '../user';

import { AuthResolver } from './resolver';
import { JwtStrategy } from './jwt';
import { AuthService } from './service';
import { LoggerModule } from '../logger';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    JwtModule.registerAsync(jwtModuleOptions),
    PassportModule,
    UserModule,
  ],
  providers: [AuthService, AuthResolver, JwtStrategy],
})
export class AuthModule {}
