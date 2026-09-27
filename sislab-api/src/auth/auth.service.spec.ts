import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Tenant, TenantPlan } from '../tenants/entities/tenant.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RefreshTokenService } from './refresh-token.service';

const tenant = {
  id: 'tenant-a',
  name: 'Lab Demo',
  slug: 'lab-demo',
  plan: TenantPlan.PROFESIONAL,
} as Tenant;

const otherTenant = { ...tenant, id: 'tenant-b', slug: 'lab-otro' };

function buildUser(overrides: Partial<User> = {}): User {
  return Object.assign(new User(), {
    id: 'user-1',
    tenant_id: tenant.id,
    tenant,
    email: 'admin@lab-demo.com',
    password_hash: bcrypt.hashSync('password123', 4),
    role: UserRole.ADMIN,
    first_name: 'Admin',
    last_name: 'Sistema',
    is_active: true,
    last_login_at: null,
    ...overrides,
  });
}

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<
    Pick<UsersService, 'findForLogin' | 'findById' | 'touchLastLogin'>
  >;
  let refreshTokens: jest.Mocked<
    Pick<RefreshTokenService, 'issue' | 'consume' | 'revoke'>
  >;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;

  beforeEach(async () => {
    usersService = {
      findForLogin: jest.fn(),
      findById: jest.fn(),
      touchLastLogin: jest.fn().mockResolvedValue(undefined),
    };
    refreshTokens = {
      issue: jest.fn().mockResolvedValue('refresh-nuevo'),
      consume: jest.fn(),
      revoke: jest.fn().mockResolvedValue(undefined),
    };
    jwtService = { sign: jest.fn().mockReturnValue('access-token') };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: RefreshTokenService, useValue: refreshTokens },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('login', () => {
    it('retorna access + refresh token, user y tenant con credenciales válidas', async () => {
      usersService.findForLogin.mockResolvedValue(buildUser());

      const result = await service.login(
        { email: 'admin@lab-demo.com', password: 'password123' },
        tenant,
      );

      expect(result.access_token).toBe('access-token');
      expect(result.refresh_token).toBe('refresh-nuevo');
      expect(result.user).toMatchObject({
        email: 'admin@lab-demo.com',
        full_name: 'Admin Sistema',
      });
      expect(result.user).not.toHaveProperty('password_hash');
      expect(result.tenant.slug).toBe('lab-demo');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'admin@lab-demo.com',
        role: UserRole.ADMIN,
        tenant_id: 'tenant-a',
      });
      expect(usersService.touchLastLogin).toHaveBeenCalledWith('user-1');
    });

    it('busca el usuario solo dentro del tenant del request', async () => {
      usersService.findForLogin.mockResolvedValue(null);

      await expect(
        service.login(
          { email: 'admin@lab-demo.com', password: 'password123' },
          otherTenant,
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(usersService.findForLogin).toHaveBeenCalledWith(
        'tenant-b',
        'admin@lab-demo.com',
      );
    });

    it('lanza UnauthorizedException con password incorrecto', async () => {
      usersService.findForLogin.mockResolvedValue(buildUser());

      await expect(
        service.login(
          { email: 'admin@lab-demo.com', password: 'incorrecta' },
          tenant,
        ),
      ).rejects.toThrow('Credenciales inválidas');
      expect(refreshTokens.issue).not.toHaveBeenCalled();
      expect(usersService.touchLastLogin).not.toHaveBeenCalled();
    });

    it('lanza UnauthorizedException si el usuario no existe (mismo mensaje)', async () => {
      usersService.findForLogin.mockResolvedValue(null);

      await expect(
        service.login(
          { email: 'noexiste@lab-demo.com', password: 'password123' },
          tenant,
        ),
      ).rejects.toThrow('Credenciales inválidas');
    });
  });

  describe('refresh', () => {
    it('emite tokens nuevos con un refresh token válido', async () => {
      refreshTokens.consume.mockResolvedValue({
        userId: 'user-1',
        tenantId: 'tenant-a',
      });
      usersService.findById.mockResolvedValue(buildUser());

      const result = await service.refresh('refresh-viejo', tenant);

      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-nuevo',
      });
      expect(refreshTokens.consume).toHaveBeenCalledWith('refresh-viejo');
    });

    it('lanza UnauthorizedException con refresh token expirado o ya usado', async () => {
      refreshTokens.consume.mockResolvedValue(null);

      await expect(service.refresh('expirado', tenant)).rejects.toThrow(
        'Refresh token inválido o expirado',
      );
      expect(refreshTokens.issue).not.toHaveBeenCalled();
    });

    it('rechaza un refresh token de otro laboratorio', async () => {
      refreshTokens.consume.mockResolvedValue({
        userId: 'user-1',
        tenantId: 'tenant-a',
      });

      await expect(
        service.refresh('refresh-de-a', otherTenant),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rechaza el refresh si el usuario fue desactivado', async () => {
      refreshTokens.consume.mockResolvedValue({
        userId: 'user-1',
        tenantId: 'tenant-a',
      });
      usersService.findById.mockResolvedValue(buildUser({ is_active: false }));

      await expect(service.refresh('refresh-viejo', tenant)).rejects.toThrow(
        'Usuario no encontrado o inactivo',
      );
    });
  });

  describe('logout', () => {
    it('revoca el refresh token', async () => {
      await service.logout('refresh-x');
      expect(refreshTokens.revoke).toHaveBeenCalledWith('refresh-x');
    });
  });
});
