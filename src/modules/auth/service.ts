import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ErrorDescription, ValidationError } from '../../core/graphql';
import { CustomContext } from '../../common/types';

import { UserService } from '../user';

import { AuthComparePasswordDto, AuthGetTokenDto } from './dto';
import { TokenPayload } from './types';

@Injectable()
export class AuthService {
  private headers = {
    access: this.config.get('jwt.accessToken.header') as string,
    refresh: this.config.get('jwt.refreshToken.header') as string,
  };

  constructor(
    private config: ConfigService,
    private jwt: JwtService,
    private users: UserService,
  ) {}

  async encryptPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.config.get('auth.saltRounds'));
  }

  async comparePasswords({
    raw,
    encrypted,
  }: AuthComparePasswordDto): Promise<boolean> {
    const isCorrect = await bcrypt.compare(raw, encrypted);

    if (isCorrect) return true;

    throw new ValidationError({ password: ErrorDescription.PASSWORD_INVALID });
  }

  getRefreshToken(ctx: CustomContext): string {
    return ctx.req.header(this.headers.refresh);
  }

  setAccessToken({ userId, ctx }: AuthGetTokenDto): string {
    const token = this.jwt.sign({ userId: userId } as TokenPayload, {
      expiresIn: this.config.get('jwt.accessToken.expiry'),
    });

    if (ctx) {
      ctx.res.cookie(this.headers.access, token),
        {
          httpOnly: true,
          path: '/',
        };
    }

    return token;
  }

  async setRefreshToken({ userId, ctx }: AuthGetTokenDto): Promise<string> {
    const token = this.jwt.sign({ userId: userId } as TokenPayload, {
      secret: this.config.get('jwt.refreshToken.secret'),
      expiresIn: this.config.get('jwt.refreshToken.expiry'),
    });

    if (ctx) {
      ctx.res.cookie(this.headers.refresh, token),
        {
          httpOnly: true,
          path: '/',
        };
    }

    await this.users.setRefreshToken({ id: userId, token });

    return token;
  }

  decodeToken(token: string): TokenPayload {
    return this.jwt.decode(token) as TokenPayload;
  }
}
