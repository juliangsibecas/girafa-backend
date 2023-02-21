import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const { req, connectionParams } = ctx.getContext();

    return connectionParams?.Authorization
      ? { headers: { authorization: connectionParams.Authorization } }
      : req;
  }

  handleRequest(
    _err: unknown,
    user: string,
    _info: unknown,
    context: ExecutionContext,
  ): any {
    const allowAny = this.reflector.get<string[]>(
      'allow-any',
      context.getHandler(),
    );
    if (user) return user;
    if (allowAny) return true;

    throw new UnauthorizedException();
  }
}
