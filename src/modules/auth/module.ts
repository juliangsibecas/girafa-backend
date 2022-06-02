import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { jwtModuleOptions } from '../../core/jwt';

import { UserModule } from '../user';

import { AuthResolver } from './resolver';
import { JwtStrategy } from './jwt';
import { AuthService } from './service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync(jwtModuleOptions),
    PassportModule,
    UserModule,
  ],
  providers: [AuthService, AuthResolver, JwtStrategy],
})
export class AuthModule {}
