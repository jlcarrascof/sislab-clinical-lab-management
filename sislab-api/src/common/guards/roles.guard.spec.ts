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

  it('permite el acceso si la ruta no declara @Roles()', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(contextWithUser({ role: UserRole.TECNICO }))).toBe(
      true,
    );
  });

  it('permite el acceso si el usuario tiene uno de los roles requeridos', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN, UserRole.MEDICO]);
    expect(guard.canActivate(contextWithUser({ role: UserRole.MEDICO }))).toBe(
      true,
    );
  });

  it('lanza ForbiddenException si el rol no alcanza', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN]);
    expect(() =>
      guard.canActivate(contextWithUser({ role: UserRole.RECEPCIONISTA })),
    ).toThrow(ForbiddenException);
  });

  it('lanza ForbiddenException si no hay usuario en el request', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN]);
    expect(() => guard.canActivate(contextWithUser())).toThrow(
      ForbiddenException,
    );
  });
});
