import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, { message: 'El estado de la orden no es válido' })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  status: OrderStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingNumber?: string;
}
