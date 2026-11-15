import { Injectable, NotFoundException } from '@nestjs/common';
import { MovementType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const { variants, ...productData } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...productData,
        variants: {
          create: variants.map((variant) => ({
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            price: variant.price,
            stock: variant.stock,
          })),
        },
      },
      include: {
        variants: true,
        category: true,
      },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.ensureExists(id);

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: { variants: true, category: true },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.product.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`El producto con ID ${id} no existe`);
    }
    return product;
  }

  // --- MÉTODOS PÚBLICOS (Catálogo) ---

  async findAll(categoryId?: string) {
    return this.prisma.product.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: {
        variants: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true, category: true },
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

  async restockVariant(variantId: string, quantity: number, userId: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException(`La variante con ID ${variantId} no fue encontrada en el sistema`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.productVariant.update({
        where: { id: variantId },
        data: { stock: { increment: quantity } },
        include: { product: { select: { name: true } } },
      });

      await tx.stockMovement.create({
        data: {
          productVariantId: variantId,
          userId,
          quantity,
          type: MovementType.PURCHASE,
          reason: 'Reabastecimiento de inventario',
        },
      });

      return updated;
    });
  }
}