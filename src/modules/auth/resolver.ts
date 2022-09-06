import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { MailerService } from '@nestjs-modules/mailer';

import { UserService } from '../user/service';

import {
  AuthSignInInput,
  AuthSignUpInput,
  AuthRecoverPasswordInput,
  AuthGenerateRecoveryCodeInput,
  AuthChangePasswordInput,
} from './input';
import { CustomContext, Id } from '../../common/types';
import { AuthService } from './service';
import { AllowAny, CurrentUser } from './graphql';
import { AuthSignIn } from './response';
import { ValidationError } from 'src/core/graphql';

@Resolver()
export class AuthResolver {
  constructor(
    private users: UserService,
    private auth: AuthService,
    private mailer: MailerService,
  ) {}

  @Mutation(() => AuthSignIn)
  @AllowAny()
  async signUp(
    @Context() ctx: CustomContext,
    @Args('data') input: AuthSignUpInput,
  ): Promise<AuthSignIn> {
    await this.users.checkAvailability({
      email: input.email,
      nickname: input.nickname,
    });

    const password = await this.auth.encryptPassword(input.password);
    const user = await this.users.create({ ...input, password });

    const accessToken = this.auth.setAccessToken({ ctx, userId: user._id });
    const refreshToken = await this.auth.setRefreshToken({
      ctx,
      userId: user._id,
    });

    return { userId: user._id, accessToken, refreshToken };
  }

  @Mutation(() => AuthSignIn)
  @AllowAny()
  async signIn(
    @Context() ctx: CustomContext,
    @Args('data') { email, password }: AuthSignInInput,
  ): Promise<AuthSignIn> {
    const throwError = () => {
      throw new ValidationError({
        password: 'El usuario y/o contraseña son incorrectos.',
      });
    };

    const user = await this.users.getByEmail({
      email,
      select: ['_id', 'password'],
    });

    if (!user) throwError();

    const isCorrectPassword = await this.auth.comparePasswords(
      password,
      user.password,
    );

    if (!isCorrectPassword) throwError();

    const accessToken = this.auth.setAccessToken({ ctx, userId: user.id });
    const refreshToken = await this.auth.setRefreshToken({
      ctx,
      userId: user.id,
    });

    return { userId: user.id, accessToken, refreshToken };
  }

  @Mutation(() => AuthSignIn)
  @AllowAny()
  async signInFromRefreshToken(
    @Context() ctx: CustomContext,
  ): Promise<AuthSignIn> {
    const token = this.auth.getRefreshToken(ctx);

    const payload = await this.auth.decodeToken(token);

    const user = await this.users.getById({
      id: payload.userId,
      select: ['refreshToken'],
    });

    if (!user || user.refreshToken !== token) throw new UnauthorizedException();

    const accessToken = this.auth.setAccessToken({ ctx, userId: user._id });
    const refreshToken = await this.auth.setRefreshToken({
      ctx,
      userId: user._id,
    });

    return { userId: user._id, accessToken, refreshToken };
  }

  @Mutation(() => Boolean)
  @AllowAny()
  async generateRecoveryCode(
    @Args('data') { email }: AuthGenerateRecoveryCodeInput,
  ): Promise<boolean> {
    try {
      const user = await this.users.getByEmail({ email });

      if (!user)
        throw new ValidationError({
          email: 'Correo electrónico no encontrado.',
        });

      const code = Math.floor(Math.random() * (9999 - 1000) + 1000).toString();

      await this.users.setRecoveryCode({ id: user.id, code });

      const res = await this.mailer.sendMail({
        to: email,
        subject: 'Recuperar contraseña',
        text: code,
      });

      if (!res.accepted.length) throw new Error();

      return true;
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  @Mutation(() => Boolean)
  @AllowAny()
  async recoverPassword(
    @Args('data') { code, email, password }: AuthRecoverPasswordInput,
  ): Promise<boolean> {
    try {
      const user = await this.users.getByEmail({
        email,
        select: ['recoveryCode'],
      });

      if (!(user.recoveryCode && user.recoveryCode === code))
        throw new ForbiddenException('Invalid code');

      const encryptedPassword = await this.auth.encryptPassword(password);

      await this.users.setPassword({
        id: user.id,
        password: encryptedPassword,
      });

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  @Mutation(() => Boolean)
  async changePassword(
    @CurrentUser() userId: Id,
    @Args('data') { currentPassword, newPassword }: AuthChangePasswordInput,
  ): Promise<Boolean> {
    try {
      const user = await this.users.getById({
        id: userId,
        select: ['password'],
      });

      const isCorrectPassword = await this.auth.comparePasswords(
        currentPassword,
        user.password,
      );

      if (isCorrectPassword) {
        const encryptedPassword = await this.auth.encryptPassword(newPassword);
        await this.users.setPassword({
          id: user.id,
          password: encryptedPassword,
        });

        return true;
      }

      return false;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
