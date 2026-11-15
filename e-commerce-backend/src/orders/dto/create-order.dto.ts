import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === undefined || value === null ? undefined : value;

export class CreateOrderDto {
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsUUID('4', { message: 'La dirección guardada no es válida' })
  addressId?: string;

  @ValidateIf((dto: CreateOrderDto) => !dto.addressId)
  @IsString()
  @IsNotEmpty({ message: 'La dirección de envío es obligatoria' })
  @MaxLength(255)
  shippingAddress?: string;

  @ValidateIf((dto: CreateOrderDto) => !dto.addressId)
  @IsString()
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  @MaxLength(100)
  city?: string;

  @ValidateIf((dto: CreateOrderDto) => !dto.addressId)
  @IsString()
  @IsNotEmpty({ message: 'La provincia/estado es obligatoria' })
  @MaxLength(100)
  state?: string;

  @ValidateIf((dto: CreateOrderDto) => !dto.addressId)
  @IsString()
  @IsNotEmpty({ message: 'El código postal es obligatorio' })
  @MaxLength(20)
  zipCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @Transform(({ value }) => value === true || value === 'true')
  @IsOptional()
  @IsBoolean()
  saveAddress?: boolean;
}
