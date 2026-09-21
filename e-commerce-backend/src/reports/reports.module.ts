import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PrismaModule } from '../prisma/prisma.module'; // <-- Añadir esta importación

@Module({
  imports: [PrismaModule], // <-- Registrarlo aquí
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}