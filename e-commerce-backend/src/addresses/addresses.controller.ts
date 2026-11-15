import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

type AuthRequest = { user: { userId: string } };

@ApiTags('Direcciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/addresses')
export class AddressesController {
  constructor(private readonly addresses: AddressesService) {}

  @ApiOperation({ summary: 'Listar direcciones del cliente autenticado' })
  @Get()
  list(@Request() req: AuthRequest) {
    return this.addresses.list(req.user.userId);
  }

  @ApiOperation({ summary: 'Guardar una dirección de envío' })
  @Post()
  create(@Request() req: AuthRequest, @Body() dto: CreateAddressDto) {
    return this.addresses.create(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Actualizar una dirección propia' })
  @Patch(':id')
  update(@Request() req: AuthRequest, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.addresses.update(req.user.userId, id, dto);
  }

  @ApiOperation({ summary: 'Eliminar una dirección que no esté ligada a pedidos' })
  @Delete(':id')
  remove(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.addresses.remove(req.user.userId, id);
  }
}
