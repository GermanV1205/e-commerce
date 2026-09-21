import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio' })
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'El slug (URL amigable) es obligatorio' })
  @MaxLength(150)
  slug: string;
}