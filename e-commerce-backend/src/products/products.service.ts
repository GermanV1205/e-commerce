import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // --- MÉTODOS PÚBLICOS (Catálogo) ---
  
  async findAll() {
    return this.prisma.product.findMany({
      include: {
        variants: true, // Incluimos las variantes para mostrar precios y tallas
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!product) {
      throw new NotFoundException(`El producto con ID ${id} no existe`);
    }
    return product;
  }

  // --- MÉTODOS DE ADMINISTRACIÓN ---

  async updateProductImage(id: string, imageUrl: string) {
    // 1. Verificamos que el producto exista antes de intentar actualizarlo
    const product = await this.prisma.product.findUnique({ where: { id } });
    
    if (!product) {
      throw new NotFoundException(`El producto con ID ${id} no existe`);
    }

    // 2. Actualizamos estrictamente la columna de la imagen
    return this.prisma.product.update({
      where: { id },
      data: { imageUrl },
    });
  }
  // --- MÓDULO DE INVENTARIO Y COMPRAS ---

  async restockVariant(variantId: string, quantity: number) {
    // 1. Verificamos que la variante específica exista
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException(`La variante con ID ${variantId} no fue encontrada en el sistema`);
    }

    // 2. Usamos increment para evitar condiciones de carrera (race conditions)
    // si dos vendedores registran inventario exactamente al mismo tiempo.
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        stock: { increment: quantity },
      },
      include: {
        product: { select: { name: true } } // Devolvemos el nombre del producto para confirmación visual
      }
    });
  }
}