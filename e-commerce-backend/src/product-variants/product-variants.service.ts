import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductVariantsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductVariantDto: CreateProductVariantDto) {
    // 1. Validar que el producto padre exista
    const productExists = await this.prisma.product.findUnique({
      where: { id: createProductVariantDto.productId },
    });

    if (!productExists) {
      throw new NotFoundException('El producto base no existe en el catálogo');
    }

    // 2. Validar que el SKU sea único
    const skuExists = await this.prisma.productVariant.findUnique({
      where: { sku: createProductVariantDto.sku },
    });

    if (skuExists) {
      throw new ConflictException(`El código SKU ${createProductVariantDto.sku} ya está registrado`);
    }

    // 3. Registrar la variante en inventario
    return this.prisma.productVariant.create({
      data: createProductVariantDto,
    });
  }

  async findAll() {
    return this.prisma.productVariant.findMany({
      include: { product: true }
    });
  }

  async findOne(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: { product: true }
    });

    if (!variant) {
      throw new NotFoundException('Variante no encontrada');
    }
    return variant;
  }

  update(id: string, updateProductVariantDto: UpdateProductVariantDto) {
    return `This action updates a #${id} productVariant`;
  }

  remove(id: string) {
    return `This action removes a #${id} productVariant`;
  }
}