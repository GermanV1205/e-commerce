import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';

const ALLOWED_EXT = /\.(jpe?g|png|webp)$/i;
const ALLOWED_MIME = /^image\/(jpeg|jpg|png|webp)$/i;

export const fileFilter = (_req: unknown, file: Express.Multer.File, callback: Function) => {
  if (!ALLOWED_EXT.test(file.originalname) || !ALLOWED_MIME.test(file.mimetype)) {
    return callback(
      new BadRequestException('Formato inválido. Solo se permiten imágenes (jpg, jpeg, png, webp)'),
      false,
    );
  }
  callback(null, true);
};

export const editFileName = (_req: unknown, file: Express.Multer.File, callback: Function) => {
  const fileExtName = extname(file.originalname).toLowerCase();
  callback(null, `${uuidv4()}${fileExtName}`);
};
