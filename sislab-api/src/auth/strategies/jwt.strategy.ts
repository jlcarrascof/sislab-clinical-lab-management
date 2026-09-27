import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User, UserRole } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';

export interface JwtPayload {
  sub: string; // user.id
  email: string;
  role: UserRole;
  tenant_id: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  /** The returned value ends up in req.user */
  async validate(req: Request, payload: JwtPayload): Promise<User> {
    // Multi-tenant isolation: a token issued for lab A is rejected with lab B's X-Tenant-ID
    if (!req.tenant || req.tenant.id !== payload.tenant_id) {
      throw new UnauthorizedException(
        'Token does not belong to this laboratory',
      );
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }
}
