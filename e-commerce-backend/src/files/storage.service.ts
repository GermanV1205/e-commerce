import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly driver: 'local' | 's3';
  private readonly s3?: S3Client;
  private readonly bucket?: string;
  private readonly publicBase?: string;

  constructor(private readonly config: ConfigService) {
    this.driver =
      (this.config.get<string>('STORAGE_DRIVER') ?? 'local').toLowerCase() ===
      's3'
        ? 's3'
        : 'local';

    if (this.driver === 's3') {
      const endpoint = this.config.get<string>('S3_ENDPOINT');
      const accessKeyId = this.config.get<string>('S3_ACCESS_KEY');
      const secretAccessKey = this.config.get<string>('S3_SECRET_KEY');
      this.bucket = this.config.get<string>('S3_BUCKET', 'ecommerce');
      this.publicBase =
        this.config.get<string>('S3_PUBLIC_URL') ??
        `${endpoint}/${this.bucket}`;

      this.s3 = new S3Client({
        region: this.config.get<string>('S3_REGION', 'us-east-1'),
        endpoint,
        forcePathStyle:
          this.config.get<string>('S3_FORCE_PATH_STYLE', 'true') !== 'false',
        credentials:
          accessKeyId && secretAccessKey
            ? { accessKeyId, secretAccessKey }
            : undefined,
      });
    }
  }

  async onModuleInit() {
    if (this.driver !== 's3' || !this.s3 || !this.bucket) return;
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      try {
        await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.logger.log(`Bucket S3 "${this.bucket}" creado`);
      } catch (err) {
        this.logger.warn(
          `No se pudo crear el bucket S3 (puede existir ya): ${String(err)}`,
        );
      }
    }
  }

  async put(folder: string, file: Express.Multer.File): Promise<string> {
    const ext = extname(file.originalname || '').toLowerCase() || '.bin';
    const filename = `${uuidv4()}${ext}`;
    const key = `${folder}/${filename}`;
    const body = file.buffer;

    if (!body?.length) {
      throw new ServiceUnavailableException('El archivo llegó vacío');
    }

    if (this.driver === 'local') {
      const dir = join(process.cwd(), 'uploads', folder);
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, filename), body);
      return `/uploads/${key}`;
    }

    if (!this.s3 || !this.bucket) {
      throw new ServiceUnavailableException(
        'Almacenamiento S3 no está configurado',
      );
    }

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: file.mimetype,
        }),
      );
    } catch (err) {
      this.logger.error('Fallo al subir a S3', err as Error);
      throw new ServiceUnavailableException(
        'No se pudo guardar el archivo en el almacenamiento',
      );
    }

    return `${this.publicBase?.replace(/\/$/, '')}/${key}`;
  }
}
