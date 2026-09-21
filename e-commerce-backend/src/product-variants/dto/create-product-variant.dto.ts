import { IsNotEmpty, IsString, IsUUID, IsNumber, Min, IsInt, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductVariantDto {
  @IsUUID('4', { message: 'El ID del producto base no es válido' })
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  productId: string;

  @IsString()
  @IsNotEmpty({ message: 'La talla es obligatoria' })
  @MaxLength(10)
  size: string; // Ej: S, M, L, XL, Única

  @IsString()
  @IsNotEmpty({ message: 'El color es obligatorio' })
  @MaxLength(50)
  color: string; // Ej: Rojo, Azul, Negro

  @IsString()
  @IsNotEmpty({ message: 'El SKU es obligatorio' })
  @MaxLength(100)
  sku: string; // Código único de inventario

  // Transformamos el valor a número por si el frontend lo envía como string
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número válido' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price: number;

  @Type(() => Number)
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  imageUrl?: string;
}