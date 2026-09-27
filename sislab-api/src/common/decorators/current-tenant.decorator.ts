import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Request } from 'express';
import { Tenant } from '../../tenants/entities/tenant.entity';

/** @CurrentTenant() — laboratory of the request (set by TenantMiddleware) */
export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Tenant => {
    const tenant = ctx.switchToHttp().getRequest<Request>().tenant;
    if (!tenant) {
      // Only happens if the route was mistakenly excluded from TenantMiddleware
      throw new InternalServerErrorException(
        'Tenant not resolved for this route',
      );
    }
    return tenant;
  },
);
