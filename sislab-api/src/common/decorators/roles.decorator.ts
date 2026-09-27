import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

export const ROLES_KEY = 'roles';

/** @Roles(UserRole.ADMIN, ...) — read by RolesGuard */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
