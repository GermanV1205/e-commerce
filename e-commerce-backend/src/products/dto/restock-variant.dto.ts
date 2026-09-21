import { IsInt, Min } from 'class-validator';

export class RestockVariantDto {
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'Debes ingresar al menos 1 unidad al inventario' })
  quantity: number;
}