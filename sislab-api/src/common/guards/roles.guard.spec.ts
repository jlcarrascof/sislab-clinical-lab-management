import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../users/entities/user.entity';

function contextWithUser(user?: { role: UserRole }): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  afterEach(() => jest.restoreAllMocks());

  it('allows access when the route declares no @Roles()', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(
      guard.canActivate(contextWithUser({ role: UserRole.TECHNICIAN })),
    ).toBe(true);
  });

  it('allows access when the user has one of the required roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN, UserRole.DOCTOR]);
    expect(guard.canActivate(contextWithUser({ role: UserRole.DOCTOR }))).toBe(
      true,
    );
  });

  it('throws ForbiddenException when the role is not allowed', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN]);
    expect(() =>
      guard.canActivate(contextWithUser({ role: UserRole.RECEPTIONIST })),
    ).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when there is no user on the request', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN]);
    expect(() => guard.canActivate(contextWithUser())).toThrow(
      ForbiddenException,
    );
  });
});
