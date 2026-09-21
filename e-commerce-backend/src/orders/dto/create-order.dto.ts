import { IsNotEmpty, IsString, MaxLength, IsEnum, IsOptional } from 'class-validator';

// Simulamos los métodos de pago aceptados por la tienda de tu mamá
export enum PaymentMethod {
  CASH = 'CASH', // Efectivo
  TRANSFER = 'TRANSFER', // Transferencia bancaria
  CARD = 'CARD', // Tarjeta de crédito/débito
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'La dirección de envío es obligatoria' })
  @MaxLength(255)
  shippingAddress: string;

  @IsEnum(PaymentMethod, { message: 'Método de pago no válido' })
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string; // Por ejemplo: "Dejar en portería"
}