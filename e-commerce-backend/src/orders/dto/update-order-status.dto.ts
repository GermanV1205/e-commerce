import { IsEnum, IsNotEmpty } from 'class-validator';

// Definimos los estados lógicos del ciclo de compra
export enum OrderStatus {
  PENDING = 'PENDING',       // Recién comprada
  SHIPPED = 'SHIPPED',       // En camino con el mensajero
  DELIVERED = 'DELIVERED',   // Entregada al cliente
  CANCELLED = 'CANCELLED',    // Anulada
  RETURNED = 'RETURNED'    // Devuelta
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, { message: 'El estado de la orden no es válido' })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  status: OrderStatus;
}