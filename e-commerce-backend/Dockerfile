# ETAPA 1: Construccion
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# DATABASE_URL solo satisface la validacion del config durante el build.
# Se usa el binario local, nunca `npx prisma` (npx bajaria el CLI 8 del Platform).
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    node ./node_modules/prisma/build/index.js generate
RUN npm run build

# ETAPA 2: Dependencias de produccion (sin devDependencies).
# `prisma` y `@prisma/client` viven en dependencies: el contenedor ejecuta
# `migrate deploy` al arrancar y el codigo compilado importa el cliente.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# ETAPA 3: Imagen final
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Punto de montaje del volumen de imagenes; el usuario `node` debe poder escribir
RUN mkdir -p uploads && chown -R node:node /app
USER node

EXPOSE 3000
CMD ["sh", "-c", "node ./node_modules/prisma/build/index.js migrate deploy && node dist/main"]
