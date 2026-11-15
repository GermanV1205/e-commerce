import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { paymentReferenceFromOrderId } from './payment-reference';
import { Role } from '../auth/enums/role.enum';
import { MailService } from '../mail/mail.service';

const orderDetailInclude = {
  items: {
    include: {
      productVariant: { include: { product: true } },
    },
  },
  shippingAddress: true,
  payment: true,
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  getTransferInstructions() {
    return {
      method: 'TRANSFER' as const,
      bankName: this.config.get<string>('TRANSFER_BANK_NAME', 'Banco Pichincha'),
      accountType: this.config.get<string>('TRANSFER_ACCOUNT_TYPE', 'Ahorros'),
      accountNumber: this.config.get<string>('TRANSFER_ACCOUNT', '2100123456'),
      holder: this.config.get<string>('TRANSFER_HOLDER', 'Tienda de Ropa'),
      identification: this.config.get<string>('TRANSFER_ID', ''),
      currency: this.config.get<string>('TRANSFER_CURRENCY', 'USD'),
    };
  }

  async checkout(userId: string, createOrderDto: CreateOrderDto, receiptUrl: string) {
    if (!receiptUrl) {
      throw new BadRequestException('Sube la captura del comprobante de transferencia.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('El usuario no existe');
    }

    const currency = this.config.get<string>('TRANSFER_CURRENCY', 'USD');

    const order = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM carts WHERE user_id = ${userId}::uuid FOR UPDATE`;

      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: { include: { productVariant: { include: { product: true } } } },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('El carrito está vacío');
      }

      const variantIds = cart.items.map((item) => item.productVariantId);
      await tx.$queryRaw`
        SELECT id FROM product_variants
        WHERE id IN (${Prisma.join(variantIds)})
        FOR UPDATE
      `;

      const calculatedTotal = cart.items.reduce((total, item) => {
        return total + Number(item.productVariant.price) * item.quantity;
      }, 0);

      for (const item of cart.items) {
        const reserved = await tx.productVariant.updateMany({
          where: {
            id: item.productVariantId,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (reserved.count !== 1) {
          throw new BadRequestException(
            `El producto con SKU ${item.productVariant.sku} no tiene stock suficiente.`,
          );
        }
      }

      let shippingAddressId: string;
      if (createOrderDto.addressId) {
        const saved = await tx.address.findFirst({
          where: { id: createOrderDto.addressId, userId },
        });
        if (!saved) {
          throw new BadRequestException('La dirección guardada no existe');
        }
        shippingAddressId = saved.id;
      } else {
        const addressCount = await tx.address.count({ where: { userId } });
        const createdAddress = await tx.address.create({
          data: {
            userId,
            street: createOrderDto.shippingAddress!,
            city: createOrderDto.city!,
            state: createOrderDto.state!,
            zipCode: createOrderDto.zipCode!,
            isDefault: createOrderDto.saveAddress === true && addressCount === 0,
          },
        });
        shippingAddressId = createdAddress.id;
      }

      const created = await tx.order.create({
        data: {
          userId,
          totalAmount: calculatedTotal,
          status: OrderStatus.PAID,
          shippingAddressId,
        },
      });

      for (const item of cart.items) {
        const itemSubtotal = Number(item.productVariant.price) * item.quantity;
        await tx.orderItem.create({
          data: {
            orderId: created.id,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            unitPrice: item.productVariant.price,
            subtotal: itemSubtotal,
          },
        });
      }

      if (createOrderDto.notes?.trim()) {
        await tx.orderNote.create({
          data: {
            orderId: created.id,
            authorId: userId,
            content: createOrderDto.notes.trim(),
          },
        });
      }

      await tx.payment.create({
        data: {
          orderId: created.id,
          reference: paymentReferenceFromOrderId(created.id),
          amount: calculatedTotal,
          currency,
          status: PaymentStatus.APPROVED,
          paymentMethodName: 'Transferencia bancaria',
          receiptUrl,
          statusMessage: 'Comprobante de transferencia subido por el cliente',
        },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return tx.order.findUniqueOrThrow({
        where: { id: created.id },
        include: orderDetailInclude,
      });
    });

    void this.mail.notifyOrderPaid(user.email, {
      id: order.id,
      totalAmount: Number(order.totalAmount),
    });

    return order;
  }

  async findMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: orderDetailInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, actor: { userId: string; role: string }) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        ...orderDetailInclude,
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`La orden con ID ${id} no fue encontrada`);
    }

    const isStaff = actor.role === Role.ADMIN || actor.role === Role.SELLER;
    if (!isStaff && order.userId !== actor.userId) {
      throw new NotFoundException(`La orden con ID ${id} no fue encontrada`);
    }

    return order;
  }

  async findAllOrders() {
    return this.prisma.order.findMany({
      include: {
        ...orderDetailInclude,
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new NotFoundException(`La orden con ID ${id} no fue encontrada`);
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status,
        ...(trackingNumber !== undefined
          ? { trackingNumber: trackingNumber.trim() || null }
          : {}),
      },
      include: orderDetailInclude,
    });
  }

  async processReturn(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`La orden con ID ${id} no fue encontrada`);
    }

    if (
      order.status !== OrderStatus.PAID &&
      order.status !== OrderStatus.SHIPPED &&
      order.status !== OrderStatus.DELIVERED
    ) {
      throw new BadRequestException(
        'Solo se pueden devolver pedidos pagados, enviados o entregados',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: OrderStatus.RETURNED },
      });

      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return updatedOrder;
    });
  }

  async addInternalNote(orderId: string, authorId: string, content: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`La orden con ID ${orderId} no existe`);
    }

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
