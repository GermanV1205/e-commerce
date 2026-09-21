import { IsNotEmpty, IsUUID, IsInt, Min } from 'class-validator';

export class CreateCartDto {
  @IsUUID('4', { message: 'El formato del ID de la variante no es válido' })
  @IsNotEmpty({ message: 'Debe especificar el producto que desea agregar' })
  productVariantId: string;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad mínima a agregar es 1' })
  quantity: number;
}