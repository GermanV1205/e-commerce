import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty({ message: 'La calle es obligatoria' })
  @MaxLength(255)
  street: string;

  @IsString()
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty({ message: 'La provincia es obligatoria' })
  @MaxLength(100)
  state: string;

  @IsString()
  @IsNotEmpty({ message: 'El código postal es obligatorio' })
  @MaxLength(20)
  zipCode: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
