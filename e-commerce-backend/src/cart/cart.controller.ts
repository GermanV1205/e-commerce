import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Carrito y Checkout')
@ApiBearerAuth() // Requiere JWT
@UseGuards(JwtAuthGuard)
@Controller('api/v1/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Agregar un producto (variante) al carrito del cliente' })
  @ApiResponse({ status: 201, description: 'Item agregado al carrito exitosamente.' })
  @ApiResponse({ status: 400, description: 'Stock insuficiente o datos inválidos.' })
  @Post()
  addItem(@Request() req: any, @Body() createCartDto: CreateCartDto) {
    const userId = req.user.userId || req.user.sub; 
    return this.cartService.addItemToCart(userId, createCartDto);
  }

  @ApiOperation({ summary: 'Obtener el carrito actual del cliente autenticado' })
  @ApiResponse({ status: 200, description: 'Carrito recuperado con cálculo de totales.' })
  @Get()
  getCart(@Request() req: any) {
    const userId = req.user.userId || req.user.sub;
    return this.cartService.getCart(userId);
  }
}