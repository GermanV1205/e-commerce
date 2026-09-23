import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        const secret = configService.get<string>('JWT_SECRET');

        // Sin secreto no se arranca: un valor por defecto permitiría firmar tokens
        // de ADMIN a cualquiera que conozca el código fuente.
        if (!secret) {
          throw new Error('JWT_SECRET no está definido. Revisa tu archivo .env');
        }

        super({
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          ignoreExpiration: false,
          secretOrKey: secret,
        });
      }

  // Si el token es válido, Passport ejecuta este método automáticamente
  async validate(payload: any) {
    // Retornamos los datos que queremos inyectar en el objeto 'request' de la petición
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}