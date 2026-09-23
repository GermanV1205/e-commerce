jest.mock('@nestjs/config', () => ({ ConfigService: class ConfigService {} }));
jest.mock('@nestjs/jwt', () => ({ JwtService: class JwtService {} }));

import { UnauthorizedException, ConflictException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import type { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import type { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn(),
}));

const user = {
  id: 'user-1',
  email: 'admin@tienda.com',
  role: 'ADMIN',
  firstName: 'Ada',
  passwordHash: 'hashed',
};

describe('AuthService', () => {
  let service: AuthService;
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
  const jwt = { signAsync: jest.fn().mockResolvedValue('access.jwt') };
  const config = { get: jest.fn().mockReturnValue('7') };
  const res = { cookie: jest.fn(), clearCookie: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwt as unknown as JwtService,
      config as unknown as ConfigService,
    );
  });

  it('rechaza un login con credenciales inválidas', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.login('a@a.com', 'x', res as never)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('emite cookies httpOnly cuando el login es válido', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    prisma.refreshToken.create.mockResolvedValue({});

    const result = await service.login(user.email, 'Admin123!', res as never);

    expect(result.user.email).toBe(user.email);
    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(prisma.refreshToken.create).toHaveBeenCalled();
  });

  it('no permite registrar un correo duplicado', async () => {
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(
      service.register(
        { email: user.email, password: 'x', firstName: 'A', lastName: 'B' },
        res as never,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
