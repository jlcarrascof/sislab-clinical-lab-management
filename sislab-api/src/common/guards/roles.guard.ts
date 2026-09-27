import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { User, UserRole } from '../../users/entities/user.entity';

/**
 * Always use after JwtAuthGuard:
 *   @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<
      UserRole[] | undefined
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);

    // No @Roles() → being authenticated is enough
    if (!requiredRoles?.length) return true;

    const { user } = context
      .switchToHttp()
      .getRequest<Request & { user?: User }>();
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Required role: ${requiredRoles.join(' or ')}`,
      );
    }
    return true;
  }
}
