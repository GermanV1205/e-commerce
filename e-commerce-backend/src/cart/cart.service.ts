import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addItemToCart(userId: string, createCartDto: CreateCartDto) {
    // 1. Validar que la variante exista y tenga stock suficiente
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: createCartDto.productVariantId },
    });

    if (!variant) throw new NotFoundException('La variante del producto no existe');
    if (variant.stock < createCartDto.quantity) {
      throw new BadRequestException(`Stock insuficiente. Solo quedan ${variant.stock} unidades.`);
    }

    // 2. Buscar el carrito activo del usuario, si no existe, lo creamos
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    // 3. Verificar si la prenda ya está en el carrito para sumar la cantidad
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
      // 4. Agregar la nueva prenda al carrito
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

  async getCart(userId: string) {
    // Retornamos el carrito con las prendas anidadas para que el Frontend (React) 
    // pueda renderizar el resumen de la compra fácilmente.
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productVariant: {
              include: { product: true }
            }
          }
        }
      }
    });

    if (!cart) {
      return { items: [] }; // Un carrito vacío no es un error, es un estado válido
    }

    return cart;
  }
}