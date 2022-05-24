import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { jwtModuleOptions } from '../../core/jwt';

import { User, UserService } from '../user';

import { AuthResolver } from './resolver';
import { JwtStrategy } from './jwt';
import { AuthService } from './service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync(jwtModuleOptions),
    TypeOrmModule.forFeature([User]),
    PassportModule,
  ],
  exports: [TypeOrmModule],
  providers: [UserService, AuthService, AuthResolver, JwtStrategy],
})
export class AuthModule {}
