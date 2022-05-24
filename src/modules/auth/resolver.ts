import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MailerService } from '@nestjs-modules/mailer';
import { ValidationError } from 'apollo-server-express';

import { UserService } from '../user/service';

import {
  AuthSignInInput,
  AuthSignUpInput,
  AuthCheckRecoveryCodeInput,
} from './input';
import { CustomContext } from '../../common/types';
import { AuthService } from './service';
import { User } from '../user';
import { UnauthorizedException } from '@nestjs/common';
import { AllowAny } from './graphql';

@Resolver()
export class AuthResolver {
  constructor(
    private users: UserService,
    private auth: AuthService,
    private mailer: MailerService,
  ) {}

  @Mutation(() => User)
  @AllowAny()
  async signUp(
    @Context() ctx: CustomContext,
    @Args('data') input: AuthSignUpInput,
  ): Promise<User> {
    await this.users.checkAvailability({
      email: input.email,
      nickname: input.nickname,
    });

    const password = await this.auth.encryptPassword(input.password);
    const user = await this.users.create({ ...input, password });

    this.auth.setAccessToken({ ctx, userId: user.id });
    await this.auth.setRefreshToken({ ctx, userId: user.id });

    return user;
  }

  @Mutation(() => Boolean)
  @AllowAny()
  async signIn(
    @Context() ctx: CustomContext,
    @Args('data') { email, password }: AuthSignInInput,
  ): Promise<boolean> {
    const user = await this.users.getByEmail({
      email,
      select: ['id', 'password'],
    });

    if (!user) throw new ValidationError('email');

    const isCorrectPassword = await this.auth.comparePasswords(
      password,
      user.password,
    );

    if (!isCorrectPassword) throw new ValidationError('password');

    this.auth.setAccessToken({ ctx, userId: user.id });
    await this.auth.setRefreshToken({ ctx, userId: user.id });

    return true;
  }

  @Mutation(() => Boolean)
  @AllowAny()
  async signInFromRefreshToken(
    @Context() ctx: CustomContext,
  ): Promise<boolean> {
    const token = this.auth.getRefreshToken(ctx);

    const payload = await this.auth.decodeToken(token);

    const user = await this.users.getById({
      id: payload.userId,
      select: ['refreshToken'],
    });

    if (!user || user.refreshToken !== token) throw new UnauthorizedException();

    this.auth.setAccessToken({ ctx, userId: user.id });
    await this.auth.setRefreshToken({ ctx, userId: user.id });

    return true;
  }

  @Mutation(() => Boolean)
  @AllowAny()
  async generateRecoveryCode(@Args('email') email: string): Promise<boolean> {
    const user = await this.users.getByEmail({ email });

    if (!user) throw new ValidationError('email');

    const code = Math.floor(Math.random() * (9999 - 1000) + 1000).toString();

    await this.users.setRecoveryCode({ id: user.id, code });

    const res = await this.mailer.sendMail({
      to: email,
      subject: 'Recuperar contraseña',
      text: code,
    });

    if (!res.accepted.length) throw new Error();

    return true;
  }

  @Query(() => Boolean)
  @AllowAny()
  async checkRecoveryCode(
    @Args('data') { email, code }: AuthCheckRecoveryCodeInput,
  ): Promise<boolean> {
    const user = await this.users.getByEmail({
      email,
      select: ['recoveryCode'],
    });

    return user.recoveryCode === code;
  }
}
