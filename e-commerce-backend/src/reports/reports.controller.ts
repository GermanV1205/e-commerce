import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Administración y Reportes')
@ApiBearerAuth() // Requiere JWT
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Generar radiografía del negocio (Dashboard)' })
  @ApiResponse({ status: 200, description: 'Reporte generado con alertas de stock y métricas de órdenes.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Requiere rol ADMIN.' })
  @Roles(Role.ADMIN)
  @Get('dashboard')
  getDashboard() {
    return this.reportsService.getDashboardSummary();
  }
}