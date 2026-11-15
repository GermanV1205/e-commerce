import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { city: 'asc' }],
    });
  }

  async create(userId: string, dto: CreateAddressDto) {
    const count = await this.prisma.address.count({ where: { userId } });
    const isDefault = dto.isDefault === true || count === 0;

    if (isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        userId,
        street: dto.street,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
        isDefault,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateAddressDto) {
    await this.requireOwned(userId, id);

    if (dto.isDefault === true) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    await this.requireOwned(userId, id);
    const used = await this.prisma.order.count({
      where: { shippingAddressId: id },
    });
    if (used > 0) {
      throw new ConflictException(
        'Esta dirección ya se usó en un pedido. No se puede borrar; puedes dejar de marcarla como predeterminada.',
      );
    }
    return this.prisma.address.delete({ where: { id } });
  }

  private async requireOwned(userId: string, id: string) {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });
    if (!address) {
      throw new NotFoundException('La dirección no existe');
    }
    return address;
  }
}
