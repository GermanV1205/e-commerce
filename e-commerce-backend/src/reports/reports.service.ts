import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardSummary() {
    // Ejecutamos las consultas en paralelo para optimizar el tiempo de respuesta
    const [pendingOrdersCount, deliveredOrdersCount, lowStockVariants] = await Promise.all([
      // 1. Órdenes que tu mamá necesita despachar
      this.prisma.order.count({
        where: { status: 'PENDING' },
      }),

      // 2. Órdenes completadas con éxito
      this.prisma.order.count({
        where: { status: 'DELIVERED' },
      }),

      // 3. Mercadería a punto de agotarse (menos de 5 unidades)
      this.prisma.productVariant.findMany({
        where: { stock: { lt: 5 } },
        include: {
          product: { select: { name: true } }, 
        },
        orderBy: { stock: 'asc' },
        take: 10, // Limitamos a los 10 casos más urgentes
      }),
    ]);

    // Formateamos la respuesta para el futuro dashboard en React
    return {
      metrics: {
        pendingOrders: pendingOrdersCount,
        completedOrders: deliveredOrdersCount,
        criticalStockAlerts: lowStockVariants.length,
      },
      lowStockItems: lowStockVariants.map((variant) => ({
        id: variant.id,
        productName: variant.product.name,
        stock: variant.stock,
      })),
    };
  }
}