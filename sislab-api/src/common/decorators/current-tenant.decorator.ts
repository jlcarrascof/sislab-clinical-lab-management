import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Request } from 'express';
import { Tenant } from '../../tenants/entities/tenant.entity';

/** @CurrentTenant() — laboratorio del request (lo adjunta TenantMiddleware) */
export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Tenant => {
    const tenant = ctx.switchToHttp().getRequest<Request>().tenant;
    if (!tenant) {
      // Solo pasa si la ruta quedó excluida del TenantMiddleware por error
      throw new InternalServerErrorException(
        'Tenant no resuelto para esta ruta',
      );
    }
    return tenant;
  },
);
