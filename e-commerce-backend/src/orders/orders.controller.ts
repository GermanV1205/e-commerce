import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderNoteDto } from './dto/create-order-note.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto'; // <-- Importación añadida para evitar errores
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Pedidos, Devoluciones y Soporte') // Agrupa estas rutas en Swagger
@ApiBearerAuth() // Indica que todo este controlador requiere token JWT
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ====================================================================
  // RUTAS DE CLIENTES
  // ====================================================================

  @ApiOperation({ summary: 'Procesar el Checkout y crear una nueva orden (Transacción ACID)' })
  @ApiResponse({ status: 201, description: 'Orden creada exitosamente y stock descontado del inventario.' })
  @ApiResponse({ status: 400, description: 'Stock insuficiente o datos de orden inválidos.' })
  @Post('checkout')
  checkout(@Request() req: any, @Body() createOrderDto: CreateOrderDto) {
    const userId = req.user.userId || req.user.sub;
    return this.ordersService.checkout(userId, createOrderDto);
  }

  @ApiOperation({ summary: 'Obtener el historial de compras del cliente autenticado' })
  @ApiResponse({ status: 200, description: 'Historial de órdenes recuperado exitosamente.' })
  @Get('my-orders')
  findMyOrders(@Request() req: any) {
    const userId = req.user.userId || req.user.sub;
    return this.ordersService.findMyOrders(userId);
  }

  // ====================================================================
  // RUTAS DE ADMINISTRACIÓN
  // ====================================================================

  @ApiOperation({ summary: 'Obtener todas las órdenes de la tienda (Panel de Administración)' })
  @ApiResponse({ status: 200, description: 'Lista completa de órdenes.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol ADMIN o SELLER.' })
  @Roles(Role.ADMIN, Role.SELLER)
  @Get()
  findAllOrders() {
    return this.ordersService.findAllOrders();
  }

  @ApiOperation({ summary: 'Actualizar el estado de una orden (ej. de PENDING a SHIPPED)' })
  @ApiParam({ name: 'id', description: 'UUID de la orden' })
  @ApiResponse({ status: 200, description: 'Estado de la orden actualizado correctamente.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  @Roles(Role.ADMIN, Role.SELLER)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, updateOrderStatusDto.status);
  }

  @ApiOperation({ summary: 'Procesar una devolución (Flujo Inverso) y restaurar stock' })
  @ApiParam({ name: 'id', description: 'UUID de la orden' })
  @ApiResponse({ status: 200, description: 'Orden marcada como devuelta y stock restaurado en catálogo.' })
  @ApiResponse({ status: 400, description: 'La orden ya ha sido cancelada o devuelta.' })
  @Roles(Role.ADMIN, Role.SELLER)
  @Patch(':id/return')
  processReturn(@Param('id') id: string) {
    return this.ordersService.processReturn(id);
  }

  @ApiOperation({ summary: 'Agregar una nota interna de soporte a la orden' })
  @ApiParam({ name: 'id', description: 'UUID de la orden' })
  @ApiResponse({ status: 201, description: 'Nota agregada al registro interno de la orden.' })
  @Roles(Role.ADMIN, Role.SELLER)
  @Post(':id/notes')
  addInternalNote(
    @Param('id') orderId: string,
    @Request() req: any,
    @Body() noteDto: CreateOrderNoteDto,
  ) {
    // Extraemos el ID del administrador desde el token JWT
    const userId = req.user.userId || req.user.sub;
    return this.ordersService.addInternalNote(orderId, userId, noteDto.content);
  }
}