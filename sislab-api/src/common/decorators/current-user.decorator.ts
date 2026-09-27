import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { User } from '../../users/entities/user.entity';

/** @CurrentUser() — authenticated user (set on req.user by JwtStrategy) */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User =>
    ctx.switchToHttp().getRequest<Request & { user: User }>().user,
);
