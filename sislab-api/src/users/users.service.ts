import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id }, relations: { tenant: true } });
  }

  /** Incluye password_hash (oculto por defecto) — solo para autenticación */
  findForLogin(tenantId: string, email: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password_hash')
      .leftJoinAndSelect('user.tenant', 'tenant')
      .where('user.tenant_id = :tenantId', { tenantId })
      .andWhere('LOWER(user.email) = LOWER(:email)', { email })
      .andWhere('user.is_active = true')
      .getOne();
  }

  async touchLastLogin(id: string): Promise<void> {
    await this.userRepo.update(id, { last_login_at: new Date() });
  }
}
