# ETAPA 1: Compilar TypeScript con el CLI de Nest
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm ci
COPY . .
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    node ./node_modules/prisma/build/index.js generate \
 && npm run build \
 && npm prune --omit=dev

# ETAPA 2: Imagen final solo con runtime
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

RUN mkdir -p uploads && chown -R node:node /app
USER node

EXPOSE 3000
CMD ["sh", "-c", "node ./node_modules/prisma/build/index.js migrate deploy && node dist/main"]
