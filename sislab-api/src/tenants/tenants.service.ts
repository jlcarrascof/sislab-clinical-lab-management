import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  findBySlug(slug: string): Promise<Tenant | null> {
    return this.tenantRepo.findOneBy({ slug });
  }

  findById(id: string): Promise<Tenant | null> {
    return this.tenantRepo.findOneBy({ id });
  }
}
