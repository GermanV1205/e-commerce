import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Permite usar Prisma en cualquier módulo sin tener que importarlo constantemente
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}