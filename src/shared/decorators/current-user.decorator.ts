import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserRequest } from '@shared/types/users';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: keyof UserRequest | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) return undefined;
    return data ? user[data] : user;
  },
);
