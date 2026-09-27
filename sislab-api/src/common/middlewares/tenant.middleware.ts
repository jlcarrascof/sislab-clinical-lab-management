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
 * Resolves the laboratory (tenant) of every request from the X-Tenant-ID header (slug).
 * Similar to a Laravel middleware doing $request->merge(['tenant' => ...]).
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantsService: TenantsService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const slug = req.header(TENANT_HEADER)?.trim();
    if (!slug) {
      throw new BadRequestException('X-Tenant-ID header is required');
    }

    const tenant = await this.tenantsService.findBySlug(slug);
    if (!tenant) {
      throw new NotFoundException(`Laboratory '${slug}' not found`);
    }
    if (!tenant.is_active) {
      throw new ForbiddenException('This laboratory is inactive');
    }

    req.tenant = tenant;
    next();
  }
}
