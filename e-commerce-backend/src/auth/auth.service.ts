import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import type { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  clearAuthCookies,
  refreshCookieOptions,
} from './auth-cookies';

type PublicUser = {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(data: RegisterDto, res: Response) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });

    return this.issueSession(user, res);
  }

  async login(email: string, pass: string, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.issueSession(user, res);
  }

  async refresh(refreshToken: string | undefined, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('No hay sesión activa');
    }

    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      clearAuthCookies(res);
      throw new UnauthorizedException('La sesión expiró. Inicia sesión de nuevo.');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    return this.issueSession(stored.user, res);
  }

  async logout(refreshToken: string | undefined, res: Response) {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({
        where: { tokenHash: this.hashToken(refreshToken) },
      });
    }

    clearAuthCookies(res);
    return { message: 'Sesión cerrada' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, firstName: true, lastName: true },
    });
    if (!user) {
      throw new UnauthorizedException('No hay sesión activa');
    }
    return { user };
  }

  async updateProfile(userId: string, data: { firstName: string; lastName: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { firstName: data.firstName.trim(), lastName: data.lastName.trim() },
      select: { id: true, email: true, role: true, firstName: true, lastName: true },
    });
    return { user };
  }

  private async issueSession(
    user: { id: string; email: string; role: string; firstName: string; lastName: string },
    res: Response,
  ) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    const refreshTtlMs = this.refreshTtlMs();
    const refreshRaw = randomBytes(48).toString('hex');

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hashToken(refreshRaw),
        userId: user.id,
        expiresAt: new Date(Date.now() + refreshTtlMs),
      },
    });

    res.cookie(ACCESS_COOKIE, accessToken, accessCookieOptions(this.accessTtlMs()));
    res.cookie(REFRESH_COOKIE, refreshRaw, refreshCookieOptions(refreshTtlMs));

    const publicUser: PublicUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return { user: publicUser };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private accessTtlMs() {
    return 15 * 60 * 1000;
  }

  private refreshTtlMs() {
    const days = Number(this.configService.get('JWT_REFRESH_EXPIRES_DAYS') ?? 7);
    return days * 24 * 60 * 60 * 1000;
  }
}
