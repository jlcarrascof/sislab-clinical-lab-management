import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { TenantsService } from '../../tenants/tenants.service';

export const TENANT_HEADER = 'x-tenant-id';

/**
 * Resuelve el laboratorio (tenant) de cada request a partir del header X-Tenant-ID (slug).
 * Equivalente a un middleware de Laravel que hace $request->merge(['tenant' => ...]).
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantsService: TenantsService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const slug = req.header(TENANT_HEADER)?.trim();
    if (!slug) {
      throw new BadRequestException('Header X-Tenant-ID es requerido');
    }

    const tenant = await this.tenantsService.findBySlug(slug);
    if (!tenant) {
      throw new NotFoundException(`Laboratorio '${slug}' no encontrado`);
    }
    if (!tenant.is_active) {
      throw new ForbiddenException('Este laboratorio está inactivo');
    }

    req.tenant = tenant;
    next();
  }
}
