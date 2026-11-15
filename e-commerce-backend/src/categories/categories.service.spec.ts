import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CategoriesService', () => {
  const prisma = {
    category: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: { count: jest.fn() },
  };
  const service = new CategoriesService(prisma as unknown as PrismaService);

  beforeEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('actualiza una categoría existente', async () => {
    prisma.category.findUnique.mockResolvedValue({ id: 'c1', slug: 'old' });
    prisma.category.findFirst.mockResolvedValue(null);
    prisma.category.update.mockResolvedValue({ id: 'c1', name: 'Nueva' });

    await service.update('c1', { name: 'Nueva' });

    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { name: 'Nueva' },
    });
  });

  it('no elimina si hay productos', async () => {
    prisma.category.findUnique.mockResolvedValue({ id: 'c1' });
    prisma.product.count.mockResolvedValue(2);

    await expect(service.remove('c1')).rejects.toBeInstanceOf(ConflictException);
  });

  it('404 si no existe', async () => {
    prisma.category.findUnique.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toBeInstanceOf(NotFoundException);
  });
});
