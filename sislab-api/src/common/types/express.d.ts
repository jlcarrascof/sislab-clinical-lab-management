import type { Tenant } from '../../tenants/entities/tenant.entity';

declare global {
  namespace Express {
    interface Request {
      /** Adjuntado por TenantMiddleware a partir del header X-Tenant-ID */
      tenant?: Tenant;
    }
  }
}

export {};
