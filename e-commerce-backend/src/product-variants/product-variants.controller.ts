import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Variantes de Producto (Inventario)')
@Controller('api/v1/product-variants')
export class ProductVariantsController {
  constructor(private readonly productVariantsService: ProductVariantsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar una nueva variante (Talla, Color, Stock)' })
  @ApiResponse({ status: 201, description: 'Variante creada en el inventario.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProductVariantDto: CreateProductVariantDto) {
    return this.productVariantsService.create(createProductVariantDto);
  }

  @ApiOperation({ summary: 'Obtener todas las variantes' })
  @Get()
  findAll() {
    return this.productVariantsService.findAll();
  }

  @ApiOperation({ summary: 'Obtener detalle de una variante' })
  @ApiParam({ name: 'id', description: 'UUID de la variante' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productVariantsService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una variante (Precio, Detalles)' })
  @ApiParam({ name: 'id', description: 'UUID de la variante' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductVariantDto: UpdateProductVariantDto) {
    return this.productVariantsService.update(id, updateProductVariantDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una variante' })
  @ApiParam({ name: 'id', description: 'UUID de la variante' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productVariantsService.remove(id);
  }
}