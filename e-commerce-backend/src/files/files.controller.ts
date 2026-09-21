import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { fileFilter, editFileName } from './helpers/image-storage.helper';

// Importaciones de Seguridad Perimetral
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Archivos y Almacenamiento') // Categoría en Swagger
@ApiBearerAuth() // Requiere token JWT
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/files')
export class FilesController {
  
  @ApiOperation({ summary: 'Subir una imagen para el catálogo de productos (Max 5MB)' })
  @ApiConsumes('multipart/form-data') // Habilita el botón de "Seleccionar Archivo" en Swagger
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
  @ApiResponse({ status: 201, description: 'Imagen subida y guardada exitosamente (Preparado para S3).' })
  @ApiResponse({ status: 400, description: 'Archivo inválido, formato no soportado o tamaño excedido.' })
  @ApiResponse({ status: 403, description: 'Prohibido. Requiere rol ADMIN o SELLER.' })
  @Roles(Role.ADMIN, Role.SELLER)
  @Post('product-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // Directorio físico donde se guardarán (preparación para S3)
        filename: editFileName,
      }),
      fileFilter: fileFilter,
      limits: { fileSize: 1024 * 1024 * 5 }, // Límite de 5MB por imagen para cuidar el desempeño
    }),
  )
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Asegúrese de enviar un archivo de imagen válido');
    }

    // Retornamos la ruta donde el frontend podrá consumir la imagen
    const fileUrl = `http://localhost:3000/uploads/${file.filename}`;
    
    return {
      message: 'Imagen subida exitosamente',
      fileName: file.filename,
      url: fileUrl,
    };
  }
}