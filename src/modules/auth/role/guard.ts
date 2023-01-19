import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { User } from '../../../modules/user';

import { ROLES_KEY } from './constant';
import { RoleMetadata } from './types';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector, private config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const metadata = this.reflector.getAllAndOverride<RoleMetadata>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!metadata) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const user: User = ctx.getContext().req.user;

    return user.email === this.config.get('app.adminEmail');
  }
}
