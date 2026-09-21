import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Miramos qué roles exige la ruta actual (leemos el decorador)
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Si la ruta no tiene el decorador @Roles, la dejamos pasar (ya la protege JwtAuthGuard)
    if (!requiredRoles) {
      return true;
    }

    // 2. Obtenemos el usuario de la petición (inyectado previamente por JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // 3. Verificamos si el rol del usuario está dentro de los permitidos
    // IMPORTANTE: Asegúrate de que tu AuthModule esté guardando el 'role' dentro del payload del JWT.
    if (!user || !user.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Acceso denegado: No tienes los permisos necesarios para realizar esta acción.');
    }

    return true;
  }
}