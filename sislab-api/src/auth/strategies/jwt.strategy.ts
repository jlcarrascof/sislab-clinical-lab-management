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

  /** Lo que retorna queda en req.user */
  async validate(req: Request, payload: JwtPayload): Promise<User> {
    // Aislamiento multi-tenant: un token del laboratorio A no sirve con X-Tenant-ID del B
    if (!req.tenant || req.tenant.id !== payload.tenant_id) {
      throw new UnauthorizedException(
        'El token no pertenece a este laboratorio',
      );
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }
    return user;
  }
}
