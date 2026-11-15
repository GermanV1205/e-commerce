# DevOps: Docker, CI y producción

## Entornos

| Entorno | Cómo levantarlo | Almacenamiento | API docs |
|---|---|---|---|
| Desarrollo local | Postgres en Docker + `npm run start:dev` | Disco (`STORAGE_DRIVER=local`) | Swagger en `/api/docs` |
| Demo Docker | `docker compose up -d --build` | MinIO (S3 compatible) | Swagger si `SWAGGER_ENABLED=true` |
| Producción | `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d` detrás de HTTPS | MinIO, AWS S3 o R2 | Swagger apagado |

## Pipeline (GitHub Actions)

`.github/workflows/ci.yml` ejecuta:

1. Backend: lint, build, Jest, migraciones contra Postgres de servicio.
2. Frontend: lint y build.
3. Imágenes Docker.
4. Playwright (Chromium) contra API + `vite preview`, con seed de catálogo.

## Health checks

- `GET /api/v1/health` — el proceso vive.
- `GET /api/v1/health/ready` — hay conexión a PostgreSQL.

El contenedor `api` usa el primero como `HEALTHCHECK` de Docker.

## Archivos y correos

- Imágenes de producto y comprobantes pasan por `StorageService` (disco o S3).
- Sin `SMTP_HOST` el correo de pedido pagado se escribe en logs (útil en demo).
- Con SMTP se envía un aviso al cliente.

## Checklist antes de publicar

- [ ] `JWT_SECRET` largo y único (mínimo 16 caracteres).
- [ ] `CORS_ORIGIN` y `FRONTEND_URL` con el dominio HTTPS real.
- [ ] Cookies: en producción van `Secure` + `SameSite=None` (hace falta HTTPS).
- [ ] Cuenta bancaria real en `TRANSFER_*` (no dejes el ejemplo).
- [ ] Bucket S3/MinIO con lectura pública de objetos o un CDN delante.
- [ ] Backups de Postgres (volumen o dump programado).
- [ ] Proxy (Caddy/Nginx/Traefik) terminando TLS hacia `web:80` y opcionalmente `api:3000`.
