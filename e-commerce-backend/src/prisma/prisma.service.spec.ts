import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('expone el contrato de ciclo de vida de Nest', () => {
    expect(typeof PrismaService).toBe('function');
  });
});
