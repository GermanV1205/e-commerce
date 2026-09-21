import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client'; // Importamos el Enum estricto de Prisma

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async checkout(userId: string, createOrderDto: CreateOrderDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { productVariant: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    for (const item of cart.items) {
      if (item.productVariant.stock < item.quantity) {
        throw new BadRequestException(`El producto con SKU ${item.productVariant.sku} no tiene stock suficiente.`);
      }
    }

    const calculatedTotal = cart.items.reduce((total, item) => {
      return total + (Number(item.productVariant.price) * item.quantity);
    }, 0);

    return this.prisma.$transaction(async (tx) => {
      const newAddress = await tx.address.create({
        data: {
          userId: userId,
          street: createOrderDto.shippingAddress,
          city: 'Quito',
          state: 'Pichincha',
          zipCode: '170100',
        },
      });

      const order = await tx.order.create({
        data: {
          userId: userId,
          totalAmount: calculatedTotal,
          status: 'PENDING',
          shippingAddressId: newAddress.id, 
        },
      });

      for (const item of cart.items) {
        const itemSubtotal = Number(item.productVariant.price) * item.quantity;

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            unitPrice: item.productVariant.price,
            subtotal: itemSubtotal, 
          },
        });

        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });
  }

  async findMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            productVariant: {
              include: { product: true },
            },
          },
        },
        shippingAddress: true, 
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- MÉTODOS DE ADMINISTRACIÓN ---

  async findAllOrders() {
    return this.prisma.order.findMany({
      include: {
        items: {
          include: {
            productVariant: { include: { product: true } },
          },
        },
        shippingAddress: true,
        user: { 
          // Si tienes otro campo como 'firstName', puedes agregarlo aquí. 
          // Por ahora, solo extraemos id y email para evitar el error TS2353.
          select: { id: true, email: true } 
        } 
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Cambiamos el tipo de string a OrderStatus (el enum de Prisma)
  async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    
    if (!order) {
      throw new NotFoundException(`La orden con ID ${id} no fue encontrada`);
    }

    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async processReturn(id: string) {
    // 1. Buscamos la orden y sus items (para saber qué productos devolver)
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`La orden con ID ${id} no fue encontrada`);
    }

    // 2. Validamos que no se intente devolver algo que ya fue cancelado o devuelto
    if (order.status === 'RETURNED' || order.status === 'CANCELLED') {
      throw new BadRequestException('Esta orden ya ha sido devuelta o cancelada previamente');
    }

    // 3. Ejecutamos la Transacción ACID
    return this.prisma.$transaction(async (tx) => {
      // Paso A: Cambiar el estado de la orden
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: 'RETURNED' },
      });

      // Paso B: Devolver el inventario a la tienda (Incrementar stock)
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { 
            stock: { increment: item.quantity } // Prisma suma automáticamente la cantidad
          },
        });
      }

      return updatedOrder;
    });
  }
  // --- MÓDULO DE SOPORTE Y NOTAS INTERNAS ---

  async addInternalNote(orderId: string, authorId: string, content: string) {
    // Validamos que la orden exista
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`La orden con ID ${orderId} no existe`);
    }

    // Creamos la nota y devolvemos los datos del autor para confirmación visual
    return this.prisma.orderNote.create({
      data: {
        orderId,
        authorId,
        content,
      },
      include: {
        author: {
          select: { firstName: true, lastName: true, email: true, role: true }, 
        },
      },
    });
  }
}