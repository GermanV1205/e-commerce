import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { fileFilter } from './helpers/image-storage.helper';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Archivos y Almacenamiento')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/files')
export class FilesController {
  constructor(private readonly storage: StorageService) {}

  @ApiOperation({
    summary: 'Subir una imagen para el catálogo (disco local o S3/MinIO)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (jpg, jpeg, png, webp)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Imagen subida. Devuelve la URL pública.',
  })
  @Roles(Role.ADMIN, Role.SELLER)
  @Post('product-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter,
      limits: { fileSize: 1024 * 1024 * 5 },
    }),
  )
  async uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'Asegúrese de enviar un archivo de imagen válido',
      );
    }

    const url = await this.storage.put('products', file);
    return {
      message: 'Imagen subida exitosamente',
      url,
    };
  }
}
