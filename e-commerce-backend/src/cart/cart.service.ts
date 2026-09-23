import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addItemToCart(userId: string, createCartDto: CreateCartDto) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: createCartDto.productVariantId },
    });

    if (!variant) throw new NotFoundException('La variante del producto no existe');
    if (variant.stock < createCartDto.quantity) {
      throw new BadRequestException(`Stock insuficiente. Solo quedan ${variant.stock} unidades.`);
    }

    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productVariantId: createCartDto.productVariantId },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + createCartDto.quantity;
      if (variant.stock < newQuantity) {
        throw new BadRequestException('El stock no cubre la cantidad total en tu carrito');
      }
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productVariantId: createCartDto.productVariantId,
          quantity: createCartDto.quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    const item = await this.findOwnedItem(userId, itemId);

    if (item.productVariant.stock < quantity) {
      throw new BadRequestException(
        `Stock insuficiente. Solo quedan ${item.productVariant.stock} unidades.`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    await this.findOwnedItem(userId, itemId);
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getCart(userId);
  }

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productVariant: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!cart) {
      return { items: [], totalItems: 0, totalAmount: 0 };
    }

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + Number(item.productVariant.price) * item.quantity,
      0,
    );

    return { ...cart, totalItems, totalAmount };
  }

  private async findOwnedItem(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        productVariant: true,
      },
    });

    if (!item || item.cart.userId !== userId) {
      throw new NotFoundException('El artículo no está en tu carrito');
    }

    return item;
  }
}
