import { Module } from '@nestjs/common';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy'; // <-- Importar aquí

@Module({
  imports: [
    PassportModule,
    // Usamos registerAsync para asegurarnos de que el .env ya se cargó
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET no está definido. Revisa tu archivo .env');
        }
        return {
          secret,
          signOptions: {
            // `expiresIn` espera el tipo plantilla StringValue de la librería ms
            expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ??
              '8h') as SignOptions['expiresIn'],
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // <-- Añadir a providers
})
export class AuthModule {}