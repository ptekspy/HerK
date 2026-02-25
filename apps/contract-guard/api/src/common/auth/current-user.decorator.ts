import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

import type { CurrentUser, AuthenticatedRequest } from './current-user.type';

export const CurrentUserContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.currentUser) {
      throw new UnauthorizedException('No authenticated user found in request context.');
    }

    return request.currentUser;
  },
);
