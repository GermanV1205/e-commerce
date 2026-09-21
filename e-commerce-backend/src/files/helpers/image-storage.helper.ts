import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';

// 1. Filtro de seguridad: Solo permitimos imágenes
export const fileFilter = (req: any, file: Express.Multer.File, callback: Function) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
    return callback(
      new BadRequestException('Formato inválido. Solo se permiten imágenes (jpg, jpeg, png, webp)'),
      false,
    );
  }
  callback(null, true);
};

// 2. Renombrado criptográfico: Evita colisiones y ofusca el nombre original
export const editFileName = (req: any, file: Express.Multer.File, callback: Function) => {
  const fileExtName = extname(file.originalname);
  const randomName = uuidv4();
  callback(null, `${randomName}${fileExtName}`);
};