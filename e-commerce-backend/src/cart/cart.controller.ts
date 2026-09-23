import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Carrito y Checkout')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Agregar un producto (variante) al carrito del cliente' })
  @ApiResponse({ status: 201, description: 'Item agregado al carrito exitosamente.' })
  @Post()
  addItem(@Request() req: { user: { userId: string } }, @Body() createCartDto: CreateCartDto) {
    return this.cartService.addItemToCart(req.user.userId, createCartDto);
  }

  @ApiOperation({ summary: 'Obtener el carrito actual del cliente autenticado' })
  @Get()
  getCart(@Request() req: { user: { userId: string } }) {
    return this.cartService.getCart(req.user.userId);
  }

  @ApiOperation({ summary: 'Actualizar la cantidad de un artículo del carrito' })
  @ApiParam({ name: 'itemId', description: 'UUID del item del carrito' })
  @Patch('items/:itemId')
  updateItem(
    @Request() req: { user: { userId: string } },
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(req.user.userId, itemId, dto.quantity);
  }

  @ApiOperation({ summary: 'Quitar un artículo del carrito' })
  @ApiParam({ name: 'itemId', description: 'UUID del item del carrito' })
  @Delete('items/:itemId')
  removeItem(@Request() req: { user: { userId: string } }, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(req.user.userId, itemId);
  }
}
