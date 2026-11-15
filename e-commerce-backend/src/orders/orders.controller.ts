import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderNoteDto } from './dto/create-order-note.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { fileFilter } from '../files/helpers/image-storage.helper';
import { StorageService } from '../files/storage.service';

type AuthRequest = {
  user: { userId?: string; sub?: string; role: Role };
};

const actor = (req: AuthRequest) => ({
  userId: req.user.userId || req.user.sub || '',
  role: req.user.role,
});

@ApiTags('Pedidos, Devoluciones y Soporte')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly storage: StorageService,
  ) {}

  @ApiOperation({ summary: 'Datos bancarios para pagar por transferencia' })
  @Get('transfer-info')
  transferInfo() {
    return this.ordersService.getTransferInstructions();
  }

  @ApiOperation({
    summary:
      'Checkout por transferencia: reserva stock y adjunta el comprobante',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['receipt'],
      properties: {
        addressId: { type: 'string' },
        shippingAddress: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        zipCode: { type: 'string' },
        notes: { type: 'string' },
        saveAddress: { type: 'boolean' },
        receipt: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Pedido creado en estado pagado con el comprobante.',
  })
  @Post('checkout')
  @UseInterceptors(
    FileInterceptor('receipt', {
      storage: memoryStorage(),
      fileFilter,
      limits: { fileSize: 1024 * 1024 * 5 },
    }),
  )
  async checkout(
    @Request() req: AuthRequest,
    @Body() createOrderDto: CreateOrderDto,
    @UploadedFile() receipt: Express.Multer.File,
  ) {
    if (!receipt) {
      throw new BadRequestException(
        'Sube la captura del comprobante de transferencia.',
      );
    }
    const receiptUrl = await this.storage.put('receipts', receipt);
    return this.ordersService.checkout(
      actor(req).userId,
      createOrderDto,
      receiptUrl,
    );
  }

  @ApiOperation({ summary: 'Historial de compras del cliente autenticado' })
  @Get('my-orders')
  findMyOrders(@Request() req: AuthRequest) {
    return this.ordersService.findMyOrders(actor(req).userId);
  }

  @ApiOperation({
    summary: 'Detalle de un pedido propio o, si es staff, de cualquiera',
  })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.ordersService.findOne(id, actor(req));
  }

  @ApiOperation({ summary: 'Todas las órdenes de la tienda' })
  @Roles(Role.ADMIN, Role.SELLER)
  @Get()
  findAllOrders() {
    return this.ordersService.findAllOrders();
  }

  @ApiOperation({ summary: 'Actualizar el estado logístico de una orden' })
  @Roles(Role.ADMIN, Role.SELLER)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(
      id,
      updateOrderStatusDto.status,
      updateOrderStatusDto.trackingNumber,
    );
  }

  @ApiOperation({ summary: 'Devolver un pedido pagado y restaurar stock' })
  @Roles(Role.ADMIN, Role.SELLER)
  @Patch(':id/return')
  processReturn(@Param('id') id: string) {
    return this.ordersService.processReturn(id);
  }

  @ApiOperation({ summary: 'Agregar una nota interna de soporte' })
  @Roles(Role.ADMIN, Role.SELLER)
  @Post(':id/notes')
  addInternalNote(
    @Param('id') orderId: string,
    @Request() req: AuthRequest,
    @Body() noteDto: CreateOrderNoteDto,
  ) {
    return this.ordersService.addInternalNote(
      orderId,
      actor(req).userId,
      noteDto.content,
    );
  }
}
