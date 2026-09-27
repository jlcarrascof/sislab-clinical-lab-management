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
  plan: TenantPlan.PROFESSIONAL,
} as Tenant;

const otherTenant = { ...tenant, id: 'tenant-b', slug: 'lab-other' };

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
      issue: jest.fn().mockResolvedValue('new-refresh'),
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
    it('returns access + refresh tokens, user and tenant for valid credentials', async () => {
      usersService.findForLogin.mockResolvedValue(buildUser());

      const result = await service.login(
        { email: 'admin@lab-demo.com', password: 'password123' },
        tenant,
      );

      expect(result.access_token).toBe('access-token');
      expect(result.refresh_token).toBe('new-refresh');
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

    it('looks the user up only within the request tenant', async () => {
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

    it('throws UnauthorizedException for a wrong password', async () => {
      usersService.findForLogin.mockResolvedValue(buildUser());

      await expect(
        service.login(
          { email: 'admin@lab-demo.com', password: 'wrong-password' },
          tenant,
        ),
      ).rejects.toThrow('Invalid credentials');
      expect(refreshTokens.issue).not.toHaveBeenCalled();
      expect(usersService.touchLastLogin).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException for an unknown user (same message)', async () => {
      usersService.findForLogin.mockResolvedValue(null);

      await expect(
        service.login(
          { email: 'unknown@lab-demo.com', password: 'password123' },
          tenant,
        ),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refresh', () => {
    it('issues new tokens for a valid refresh token', async () => {
      refreshTokens.consume.mockResolvedValue({
        userId: 'user-1',
        tenantId: 'tenant-a',
      });
      usersService.findById.mockResolvedValue(buildUser());

      const result = await service.refresh('old-refresh', tenant);

      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'new-refresh',
      });
      expect(refreshTokens.consume).toHaveBeenCalledWith('old-refresh');
    });

    it('throws UnauthorizedException for an expired or already used refresh token', async () => {
      refreshTokens.consume.mockResolvedValue(null);

      await expect(service.refresh('expired', tenant)).rejects.toThrow(
        'Invalid or expired refresh token',
      );
      expect(refreshTokens.issue).not.toHaveBeenCalled();
    });

    it('rejects a refresh token from another laboratory', async () => {
      refreshTokens.consume.mockResolvedValue({
        userId: 'user-1',
        tenantId: 'tenant-a',
      });

      await expect(
        service.refresh('refresh-from-a', otherTenant),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects the refresh when the user was deactivated', async () => {
      refreshTokens.consume.mockResolvedValue({
        userId: 'user-1',
        tenantId: 'tenant-a',
      });
      usersService.findById.mockResolvedValue(buildUser({ is_active: false }));

      await expect(service.refresh('old-refresh', tenant)).rejects.toThrow(
        'User not found or inactive',
      );
    });
  });

  describe('logout', () => {
    it('revokes the refresh token', async () => {
      await service.logout('refresh-x');
      expect(refreshTokens.revoke).toHaveBeenCalledWith('refresh-x');
    });
  });
});
