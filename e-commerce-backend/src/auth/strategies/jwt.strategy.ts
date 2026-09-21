import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          ignoreExpiration: false,
          // Se añade un fallback temporal para satisfacer la exigencia de tipo de TypeScript
          secretOrKey: configService.get<string>('JWT_SECRET') || 'super_secreto_ecommerce_2026_seguro', 
        });
      }

  // Si el token es válido, Passport ejecuta este método automáticamente
  async validate(payload: any) {
    // Retornamos los datos que queremos inyectar en el objeto 'request' de la petición
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}