import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateProductImageDto {
  @IsString({ message: 'La URL de la imagen debe ser un texto' })
  @IsNotEmpty({ message: 'La URL de la imagen no puede estar vacía' })
  imageUrl: string;
}