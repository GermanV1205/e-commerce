import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

describe('ProductsService', () => {
  const prisma = {
    product: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const service = new ProductsService(prisma as unknown as PrismaService);

  const dto: CreateProductDto = {
    name: 'Camiseta',
    slug: 'camiseta',
    description: 'Algodón',
    categoryId: '550e8400-e29b-41d4-a716-446655440000',
    variants: [
      { sku: 'CAM-S', size: 'S', color: 'Blanco', price: 10, stock: 3 },
    ],
  };

  beforeEach(() => jest.clearAllMocks());

  it('crea el producto con variantes anidadas', async () => {
    prisma.product.create.mockResolvedValue({ id: 'p1', ...dto });

    await service.create(dto);

    expect(prisma.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Camiseta',
          variants: { create: [expect.objectContaining({ sku: 'CAM-S' })] },
        }),
      }),
    );
  });

  it('lanza 404 al actualizar un producto inexistente', async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    await expect(
      service.update('missing', { name: 'X' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('elimina un producto existente', async () => {
    prisma.product.findUnique.mockResolvedValue({ id: 'p1' });
    prisma.product.delete.mockResolvedValue({ id: 'p1' });

    await service.remove('p1');

    expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
  });
});
