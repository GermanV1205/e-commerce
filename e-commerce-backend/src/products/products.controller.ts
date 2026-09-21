import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

import { ProductsService } from './products.service';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { RestockVariantDto } from './dto/restock-variant.dto';

// Importaciones de Seguridad Perimetral
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Catálogo y Productos') // Categoriza este módulo en la interfaz de Swagger
@Controller('api/v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ====================================================================
  // RUTAS PÚBLICAS (Disponibles para la tienda de tu mamá / Frontend)
  // ====================================================================
  
  @ApiOperation({ summary: 'Obtener todo el catálogo de productos con sus variantes' })
  @ApiResponse({ status: 200, description: 'Catálogo recuperado exitosamente.' })
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @ApiOperation({ summary: 'Obtener el detalle de un producto específico por ID' })
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiResponse({ status: 200, description: 'Producto encontrado exitosamente.' })
  @ApiResponse({ status: 404, description: 'El producto no existe.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // ====================================================================
  // RUTAS DE ADMINISTRACIÓN (Protegidas por RBAC)
  // ====================================================================
  
  @ApiBearerAuth() // Indica en Swagger que esta ruta requiere el candado JWT
  @ApiOperation({ summary: 'Actualizar la imagen estática de un producto' })
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiResponse({ status: 200, description: 'Imagen vinculada exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado. Token inválido o ausente.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Requiere rol ADMIN o SELLER.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  @Patch(':id/image')
  updateImage(
    @Param('id') id: string, 
    @Body() updateProductImageDto: UpdateProductImageDto
  ) {
    return this.productsService.updateProductImage(id, updateProductImageDto.imageUrl);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Abastecer inventario de una variante (Restock atómico)' })
  @ApiParam({ name: 'variantId', description: 'UUID de la variante del producto' })
  @ApiResponse({ status: 200, description: 'Inventario actualizado mediante transacción ACID.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Requiere rol ADMIN o SELLER.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  @Patch('variants/:variantId/restock')
  restockVariant(
    @Param('variantId') variantId: string,
    @Body() restockDto: RestockVariantDto
  ) {
    return this.productsService.restockVariant(variantId, restockDto.quantity);
  }
}