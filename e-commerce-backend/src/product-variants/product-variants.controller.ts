import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Variantes de Producto (Inventario)')
@Controller('api/v1/product-variants')
export class ProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Registrar una nueva variante (Talla, Color, Stock)',
  })
  @ApiResponse({
    status: 201,
    description: 'Variante creada en el inventario.',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido. Requiere rol ADMIN o SELLER.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
  ) {
    return this.productVariantsService.update(id, updateProductVariantDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una variante (Requiere rol ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID de la variante' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productVariantsService.remove(id);
  }
}
