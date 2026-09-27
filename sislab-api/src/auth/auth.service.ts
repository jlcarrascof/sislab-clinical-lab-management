import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenService } from './refresh-token.service';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly refreshTokens: RefreshTokenService,
  ) {}

  async login(dto: LoginDto, tenant: Tenant) {
    const user = await this.usersService.findForLogin(tenant.id, dto.email);

    // Same message for "unknown user" and "wrong password": don't reveal which emails exist
    const valid = user
      ? await bcrypt.compare(dto.password, user.password_hash)
      : false;
    if (!user || !valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersService.touchLastLogin(user.id);

    return {
      access_token: this.signAccessToken(user),
      refresh_token: await this.refreshTokens.issue({
        userId: user.id,
        tenantId: tenant.id,
      }),
      user: this.serializeUser(user),
      tenant: this.serializeTenant(tenant),
    };
  }

  async refresh(token: string, tenant: Tenant) {
    const session = await this.refreshTokens.consume(token);
    if (!session || session.tenantId !== tenant.id) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(session.userId);
    if (!user || !user.is_active || user.tenant_id !== tenant.id) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      access_token: this.signAccessToken(user),
      refresh_token: await this.refreshTokens.issue(session),
    };
  }

  async logout(token: string): Promise<void> {
    await this.refreshTokens.revoke(token);
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
