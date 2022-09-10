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
import { UnknownError, ValidationError } from 'src/core/graphql';
import { LoggerService } from '../logger';
import { ErrorCodes } from 'src/core/graphql/utils';

@Resolver()
export class AuthResolver {
  constructor(
    private logger: LoggerService,
    private mailer: MailerService,
    private users: UserService,
    private auth: AuthService,
  ) {}

  @Mutation(() => AuthSignIn)
  @AllowAny()
  async signUp(
    @Context() ctx: CustomContext,
    @Args('data') data: AuthSignUpInput,
  ): Promise<AuthSignIn> {
    try {
      await this.users.checkAvailability({
        email: data.email,
        nickname: data.nickname,
      });

      const password = await this.auth.encryptPassword(data.password);
      const user = await this.users.create({ ...data, password });

      const accessToken = this.auth.setAccessToken({ ctx, userId: user._id });
      const refreshToken = await this.auth.setRefreshToken({
        ctx,
        userId: user._id,
      });

      return {
        userId: user._id,
        accessToken,
        refreshToken,
      };
    } catch (e) {
      if (e.message === ErrorCodes.VALIDATION_ERROR) {
        throw e;
      }

      this.logger.error({
        path: 'AuthSignUp',
        data: { ...data },
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => AuthSignIn)
  @AllowAny()
  async signIn(
    @Context() ctx: CustomContext,
    @Args('data') data: AuthSignInInput,
  ): Promise<AuthSignIn> {
    try {
      const throwError = () => {
        throw new ValidationError({
          password: 'El usuario y/o contraseña son incorrectos.',
        });
      };

      const user = await this.users.getByEmail({
        email: data.email,
        select: ['_id', 'password'],
      });

      if (!user) throwError();

      const isCorrectPassword = await this.auth.comparePasswords(
        data.password,
        user.password,
      );

      if (!isCorrectPassword) throwError();

      const accessToken = this.auth.setAccessToken({ ctx, userId: user.id });
      const refreshToken = await this.auth.setRefreshToken({
        ctx,
        userId: user.id,
      });

      return { userId: user.id, accessToken, refreshToken };
    } catch (e) {
      if (e.message === ErrorCodes.VALIDATION_ERROR) {
        throw e;
      }

      this.logger.error({
        path: 'AuthSignIn',
        data: { ...data },
      });
      throw new UnknownError();
    }
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
    @Args('data') data: AuthGenerateRecoveryCodeInput,
  ): Promise<boolean> {
    try {
      const user = await this.users.getByEmail(data);

      if (!user)
        throw new ValidationError({
          email: 'Correo electrónico no encontrado.',
        });

      const code = Math.floor(Math.random() * (9999 - 1000) + 1000).toString();

      await this.users.setRecoveryCode({ id: user.id, code });

      const res = await this.mailer.sendMail({
        to: data.email,
        subject: 'Recuperar contraseña',
        text: code,
      });

      if (!res.accepted.length) throw new Error();

      return true;
    } catch (e) {
      if (e.message === ErrorCodes.VALIDATION_ERROR) {
        throw e;
      }

      this.logger.error({
        path: 'AuthGenerateRecoveryCode',
        data: { ...data },
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => Boolean)
  @AllowAny()
  async recoverPassword(
    @Args('data') data: AuthRecoverPasswordInput,
  ): Promise<boolean> {
    try {
      const user = await this.users.getByEmail({
        email: data.email,
        select: ['recoveryCode'],
      });

      if (!(user.recoveryCode && user.recoveryCode === data.code))
        throw new ForbiddenException('Invalid code');

      const encryptedPassword = await this.auth.encryptPassword(data.password);

      await this.users.setPassword({
        id: user.id,
        password: encryptedPassword,
      });

      return true;
    } catch (e) {
      this.logger.error({
        path: 'AuthRecoveryPassword',
        data: { ...data },
      });
      throw new UnknownError();
    }
  }

  @Mutation(() => Boolean)
  async changePassword(
    @CurrentUser() userId: Id,
    @Args('data') data: AuthChangePasswordInput,
  ): Promise<Boolean> {
    try {
      const user = await this.users.getById({
        id: userId,
        select: ['password'],
      });

      const isCorrectPassword = await this.auth.comparePasswords(
        data.currentPassword,
        user.password,
      );

      if (isCorrectPassword) {
        const encryptedPassword = await this.auth.encryptPassword(
          data.newPassword,
        );
        await this.users.setPassword({
          id: user.id,
          password: encryptedPassword,
        });

        return true;
      }

      return false;
    } catch (e) {
      this.logger.error({
        path: 'AuthChangePassword',
        data: { ...data },
      });
      throw new UnknownError();
    }
  }
}
