import type { Tenant } from '../../tenants/entities/tenant.entity';

declare global {
  namespace Express {
    interface Request {
      /** Set by TenantMiddleware from the X-Tenant-ID header */
      tenant?: Tenant;
    }
  }
}

export {};
