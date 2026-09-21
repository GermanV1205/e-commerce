import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOrderNoteDto {
  @IsString({ message: 'La nota debe ser texto' })
  @IsNotEmpty({ message: 'El contenido de la nota no puede estar vacío' })
  content: string;
}