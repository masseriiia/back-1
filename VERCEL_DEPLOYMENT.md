# Деплой на Vercel

## ⚠️ Важные ограничения Vercel для NestJS

Vercel оптимизирован для serverless функций и имеет ограничения:

1. **Serverless функции** - каждый запрос создает новое подключение к БД
2. **Таймаут 10 секунд** на бесплатном плане
3. **Cold starts** - первый запрос может быть медленным
4. **Не поддерживает WebSocket** напрямую
5. **Ограничения размера** деплоя (250 MB)

### ✅ Рекомендуется для Vercel:
- Простые REST API
- Низкая нагрузка
- Быстрые операции

### ❌ НЕ рекомендуется для Vercel:
- WebSocket соединения
- Long-running задачи
- Высокая нагрузка (много одновременных запросов)
- Cron jobs

## Вариант 1: Деплой на Vercel (с ограничениями)

### Шаг 1: Установить Vercel CLI

```bash
npm install -g vercel
```

### Шаг 2: Создать vercel.json

```bash
nano vercel.json
```

Содержимое:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.ts",
      "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Шаг 3: Адаптировать main.ts для Vercel

Создайте файл `src/serverless.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as express from 'express';

const server = express();
let app;

async function createApp() {
  if (!app) {
    app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
    );

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.enableCors();

    await app.init();
  }
  return app;
}

export default async (req, res) => {
  await createApp();
  server(req, res);
};
```

### Шаг 4: Обновить vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/serverless.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/serverless.js"
    }
  ]
}
```

### Шаг 5: База данных для Vercel

**Важно:** Используйте облачную БД, а не локальную PostgreSQL!

#### Вариант A: Neon (рекомендуется для Vercel)

1. Зарегистрируйтесь на https://neon.tech
2. Создайте проект
3. Скопируйте CONNECTION POOLER строку (не обычную!)
4. Используйте в DATABASE_URL

#### Вариант B: Supabase

1. Зарегистрируйтесь на https://supabase.com
2. Создайте проект
3. Settings → Database → Connection pooling
4. Используйте Pooler connection string

#### Вариант C: PlanetScale

1. Зарегистрируйтесь на https://planetscale.com
2. Создайте базу данных
3. Получите connection string

### Шаг 6: Настроить переменные окружения в Vercel

```bash
# Войти в Vercel
vercel login

# Перейти в проект
cd vue-system-crm-backend

# Добавить переменные окружения
vercel env add DATABASE_URL
# Вставьте connection string от Neon/Supabase

vercel env add JWT_SECRET
# Вставьте случайную строку

vercel env add JWT_EXPIRATION
# 7d

vercel env add NODE_ENV
# production
```

### Шаг 7: Деплой

```bash
# Сборка проекта
npm run build

# Деплой на Vercel
vercel --prod
```

---

## ⭐ Вариант 2: Railway.app (РЕКОМЕНДУЕТСЯ)

Railway лучше подходит для NestJS приложений!

### Преимущества Railway:
- ✅ Полноценный runtime (не serverless)
- ✅ Встроенная PostgreSQL
- ✅ WebSocket поддержка
- ✅ Без ограничений на время выполнения
- ✅ Бесплатный план: $5 кредитов/месяц
- ✅ Автоматический деплой из GitHub

### Шаг 1: Подготовка

1. Зарегистрируйтесь на https://railway.app
2. Подключите GitHub репозиторий

### Шаг 2: Создать проект

```bash
# Через Railway CLI (опционально)
npm install -g @railway/cli
railway login
railway init
```

Или через веб-интерфейс:
1. New Project → Deploy from GitHub repo
2. Выберите репозиторий

### Шаг 3: Добавить PostgreSQL

1. В проекте: New → Database → PostgreSQL
2. Railway автоматически создаст переменную `DATABASE_URL`

### Шаг 4: Настроить переменные окружения

В Railway Dashboard → Variables:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRATION=7d
```

`DATABASE_URL` будет добавлена автоматически!

### Шаг 5: Настроить Build и Deploy

Railway автоматически определит NestJS, но можно указать вручную:

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npx prisma migrate deploy && npm run start:prod
```

### Шаг 6: Деплой

```bash
git push origin main
```

Railway автоматически задеплоит при push в main!

---

## ⭐ Вариант 3: Render.com (ТОЖЕ РЕКОМЕНДУЕТСЯ)

### Преимущества Render:
- ✅ Бесплатный план (с ограничениями)
- ✅ Встроенная PostgreSQL
- ✅ Простой интерфейс
- ✅ Автоматический SSL
- ✅ Автодеплой из GitHub

### Шаг 1: Подготовка

1. Зарегистрируйтесь на https://render.com
2. Создайте PostgreSQL базу: New → PostgreSQL

### Шаг 2: Создать Web Service

1. New → Web Service
2. Подключите GitHub репозиторий
3. Настройки:

**Environment:** Node
**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npx prisma migrate deploy && npm run start:prod
```

### Шаг 3: Переменные окружения

В Render Dashboard:

```env
NODE_ENV=production
DATABASE_URL=<connection string from PostgreSQL>
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=7d
```

### Шаг 4: Деплой

Render автоматически задеплоит при push в main!

---

## Сравнение платформ

| Платформа | Бесплатный план | БД включена | NestJS поддержка | Рекомендация |
|-----------|----------------|-------------|------------------|--------------|
| **Vercel** | ✅ Да | ❌ Нет | ⚠️ Ограниченно (serverless) | ❌ НЕ рекомендуется |
| **Railway** | ✅ $5/мес | ✅ Да | ✅ Отлично | ⭐ **ЛУЧШИЙ ВЫБОР** |
| **Render** | ✅ Да* | ✅ Да | ✅ Отлично | ⭐ **ХОРОШИЙ ВЫБОР** |
| **Heroku** | ❌ Платный | ✅ Да | ✅ Отлично | ⚠️ Нет бесплатного |
| **DigitalOcean** | ❌ $5/мес | ✅ Да | ✅ Отлично | ✅ Для продакшена |
| **AWS/GCP** | ⚠️ Сложно | ✅ Да | ✅ Отлично | ⚠️ Сложная настройка |

\* Render Free plan имеет ограничения: засыпает после 15 мин неактивности

---

## Рекомендация

### Для разработки и тестирования:
**Railway.app** - самый простой и быстрый вариант!

### Для продакшена:
1. **Railway Pro** ($5-20/мес) - если нужна простота
2. **VPS (DigitalOcean/Hetzner)** - если нужен полный контроль
3. **Render** - компромисс между простотой и ценой

### НЕ используйте Vercel для NestJS, если:
- Нужны WebSocket
- Ожидается высокая нагрузка
- Нужны long-running операции
- Используете Prisma (проблемы с connection pooling)

---

## Быстрый старт с Railway

```bash
# 1. Установить Railway CLI
npm install -g @railway/cli

# 2. Войти
railway login

# 3. Инициализировать проект
railway init

# 4. Добавить PostgreSQL
railway add

# 5. Деплой
railway up

# 6. Открыть приложение
railway open
```

Готово! Приложение будет доступно через несколько минут.

---

## Проверка после деплоя

```bash
# Замените URL на ваш
curl https://your-app.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "birthDate": "1990-01-01"
  }'
```
