import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateProductVariantInputDto {
  @IsString()
  @IsNotEmpty({ message: 'La talla es obligatoria' })
  @MaxLength(10)
  size: string;

  @IsString()
  @IsNotEmpty({ message: 'El color es obligatorio' })
  @MaxLength(50)
  color: string;

  @IsString()
  @IsNotEmpty({ message: 'El SKU es obligatorio' })
  @MaxLength(100)
  sku: string;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número válido' },
  )
  @Min(0, { message: 'El precio no puede ser negativo' })
  price: number;

  @Type(() => Number)
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  @MaxLength(200)
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'El slug (URL amigable) es obligatorio' })
  @MaxLength(255)
  slug: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción del producto es obligatoria' })
  description: string;

  @IsUUID('4', { message: 'El formato del ID de la categoría no es válido' })
  @IsNotEmpty({ message: 'El producto debe pertenecer a una categoría' })
  categoryId: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @IsArray()
  @ArrayMinSize(1, { message: 'El producto debe tener al menos una variante' })
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantInputDto)
  variants: CreateProductVariantInputDto[];
}
