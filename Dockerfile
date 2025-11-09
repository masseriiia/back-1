# Multi-stage build для оптимизации размера образа

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Копировать package files
COPY package*.json ./
COPY prisma ./prisma/

# Установить зависимости
RUN npm ci

# Копировать исходный код
COPY . .

# Собрать приложение
RUN npm run build

# Сгенерировать Prisma Client
RUN npx prisma generate

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Установить dumb-init для правильной обработки сигналов
RUN apk add --no-cache dumb-init

# Копировать необходимые файлы из builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Создать non-root пользователя
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

# Открыть порт
EXPOSE 3000

# Использовать dumb-init как entrypoint
ENTRYPOINT ["dumb-init", "--"]

# Запустить приложение
CMD ["node", "dist/main"]
