import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // --- MÉTODOS DE CREACIÓN (Transacción ACID) ---

  async create(createProductDto: any) {
    // 1. Extraemos 'price' para que no viaje al modelo principal Product,
    // y separamos las variantes del resto de la información del producto.
    const { price, variants, ...productData } = createProductDto;

    // 2. Ejecutamos la Escritura Anidada (Nested Write) ACID en Prisma
    return this.prisma.product.create({
      data: {
        ...productData, // Inyecta name, description, categoryId, slug, isActive
        variants: {
          create: variants.map((variant: any) => ({
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            price: variant.price, // El precio se guarda a nivel de variante
            stock: variant.stock,
          })),
        },
      },
      include: {
        variants: true, // Retorna el producto con sus variantes creadas
      },
    });
  }

  // --- MÉTODOS PÚBLICOS (Catálogo) ---
  
  async findAll() {
    return this.prisma.product.findMany({
      include: {
        variants: true, // Incluimos las variantes para mostrar precios y tallas
        category: true, // El catálogo muestra el nombre de la categoría
      },
      orderBy: { createdAt: 'desc' }
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