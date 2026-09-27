import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto, tenant: Tenant) {
    const user = await this.usersService.findForLogin(tenant.id, dto.email);

    // Mismo mensaje para "no existe" y "password incorrecto": no revelamos qué emails existen
    const valid = user
      ? await bcrypt.compare(dto.password, user.password_hash)
      : false;
    if (!user || !valid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.usersService.touchLastLogin(user.id);

    return {
      access_token: this.signAccessToken(user),
      user: this.serializeUser(user),
      tenant: this.serializeTenant(tenant),
    };
  }

  signAccessToken(
    user: Pick<User, 'id' | 'email' | 'role' | 'tenant_id'>,
  ): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
    };
    return this.jwtService.sign(payload);
  }

  getMe(user: User) {
    return {
      user: this.serializeUser(user),
      tenant: this.serializeTenant(user.tenant),
    };
  }

  private serializeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: user.fullName,
      last_login_at: user.last_login_at,
    };
  }

  private serializeTenant(tenant: Tenant) {
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
    };
  }
}
