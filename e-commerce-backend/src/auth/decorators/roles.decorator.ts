import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
// Este decorador nos permitirá usar @Roles(Role.ADMIN) encima de cualquier ruta
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);