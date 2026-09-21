import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  @MaxLength(200)
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'El slug (URL amigable) es obligatorio' })
  @MaxLength(255)
  slug: string;

  // Hacemos la descripción obligatoria para coincidir con tu esquema de base de datos
  @IsString()
  @IsNotEmpty({ message: 'La descripción del producto es obligatoria' })
  description: string;

  @IsUUID('4', { message: 'El formato del ID de la categoría no es válido' })
  @IsNotEmpty({ message: 'El producto debe pertenecer a una categoría' })
  categoryId: string;
}