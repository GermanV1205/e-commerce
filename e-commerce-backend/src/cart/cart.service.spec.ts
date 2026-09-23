import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CartService', () => {
  const prisma = {
    productVariant: { findUnique: jest.fn() },
    cart: { findUnique: jest.fn(), create: jest.fn() },
    cartItem: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const service = new CartService(prisma as unknown as PrismaService);

  beforeEach(() => jest.clearAllMocks());

  it('rechaza agregar una variante inexistente', async () => {
    prisma.productVariant.findUnique.mockResolvedValue(null);

    await expect(
      service.addItemToCart('user-1', { productVariantId: 'v1', quantity: 1 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rechaza cuando no hay stock', async () => {
    prisma.productVariant.findUnique.mockResolvedValue({ id: 'v1', stock: 1 });

    await expect(
      service.addItemToCart('user-1', { productVariantId: 'v1', quantity: 5 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('crea el carrito y agrega el primer item', async () => {
    prisma.productVariant.findUnique.mockResolvedValue({ id: 'v1', stock: 10, price: 20 });
    prisma.cart.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'c1',
        items: [{ quantity: 2, productVariant: { price: 20 } }],
      });
    prisma.cart.create.mockResolvedValue({ id: 'c1', userId: 'user-1' });
    prisma.cartItem.findFirst.mockResolvedValue(null);

    const result = await service.addItemToCart('user-1', {
      productVariantId: 'v1',
      quantity: 2,
    });

    expect(prisma.cartItem.create).toHaveBeenCalled();
    expect(result.totalItems).toBe(2);
    expect(result.totalAmount).toBe(40);
  });
});
