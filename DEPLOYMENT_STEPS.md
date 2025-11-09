# Шаги для деплоя на Railway

## Что уже сделано ✅

1. ✅ Код написан и работает локально
2. ✅ База данных Neon настроена и подключена
3. ✅ JWT_SECRET сгенерирован
4. ✅ Dockerfile исправлен для Railway
5. ✅ Миграции применены к БД

## Что нужно сделать

### Шаг 1: Загрузить код на GitHub

```bash
# Инициализировать git (если еще не сделано)
git init

# Добавить все файлы
git add .

# Создать первый коммит
git commit -m "Initial commit: NestJS CRM backend with auth"

# Создать репозиторий на GitHub (через веб-интерфейс)
# https://github.com/new

# Добавить remote и запушить
git remote add origin https://github.com/ваш-username/vue-system-crm-backend.git
git branch -M main
git push -u origin main
```

### Шаг 2: Деплой на Railway

#### Вариант А: Через веб-интерфейс (проще)

1. **Откройте Railway**
   - Перейдите на https://railway.app
   - Нажмите "Login" → войдите через GitHub

2. **Создайте проект**
   - Нажмите "New Project"
   - Выберите "Deploy from GitHub repo"
   - Выберите репозиторий `vue-system-crm-backend`

3. **Настройте переменные окружения**
   - Откройте ваш сервис
   - Перейдите в "Variables"
   - Добавьте следующие переменные:

   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_03PERjyhaUfr@ep-flat-grass-adjzu8l9-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

   JWT_SECRET=933ff57460e47cc05689e7f2f10c1e6fe583f260d3b53fb6168c2d48c1d156c010dc6d5f5394104c86556c2876c411c34f326437dc37dec3e983460856682ba9

   JWT_EXPIRATION=7d

   NODE_ENV=production
   ```

4. **Настройте команду запуска**
   - Settings → Deploy
   - Start Command:
   ```bash
   npx prisma migrate deploy && npm run start:prod
   ```

5. **Получите URL**
   - Settings → Domains → Generate Domain
   - Скопируйте ваш URL, например: `https://vue-system-crm-backend.up.railway.app`

6. **Проверьте работу**
   ```bash
   curl https://ваш-url.up.railway.app/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "firstName": "Test",
       "lastName": "User",
       "birthDate": "1990-01-01"
     }'
   ```

#### Вариант Б: Через Railway CLI

```bash
# Установить Railway CLI
npm install -g @railway/cli

# Войти
railway login

# Инициализировать проект
railway init

# Добавить переменные
railway variables set DATABASE_URL="postgresql://neondb_owner:npg_03PERjyhaUfr@ep-flat-grass-adjzu8l9-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

railway variables set JWT_SECRET="933ff57460e47cc05689e7f2f10c1e6fe583f260d3b53fb6168c2d48c1d156c010dc6d5f5394104c86556c2876c411c34f326437dc37dec3e983460856682ba9"

railway variables set JWT_EXPIRATION="7d"

railway variables set NODE_ENV="production"

# Деплой
railway up

# Открыть в браузере
railway open
```

---

## Альтернатива: Render.com

Если Railway не подходит, можно использовать Render:

1. Откройте https://render.com
2. New → Web Service
3. Подключите GitHub репозиторий
4. Настройки:
   - **Build Command:**
     ```bash
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command:**
     ```bash
     npx prisma migrate deploy && npm run start:prod
     ```

5. Добавьте переменные окружения (те же что и для Railway)

6. Нажмите "Create Web Service"

---

## После деплоя

### 1. Проверьте работу API

```bash
# Замените URL на ваш
curl https://your-app.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "birthDate": "1990-01-01"
  }'
```

### 2. Проверьте логи

**Railway:**
```bash
railway logs
```

**Render:**
- Откройте Dashboard → Logs

### 3. Настройте custom domain (опционально)

**Railway:**
- Settings → Domains → Custom Domain

**Render:**
- Settings → Custom Domain

---

## Что дальше?

После успешного деплоя:

1. ✅ Подключите фронтенд к вашему API
2. ✅ Настройте CORS для вашего домена (если нужно)
3. ✅ Добавьте мониторинг (Sentry, LogRocket)
4. ✅ Настройте CI/CD для автоматического тестирования
5. ✅ Добавьте rate limiting для защиты от DDoS

---

## Troubleshooting

### Ошибка при деплое

**Проблема:** "Failed to build"
**Решение:** Проверьте логи сборки, убедитесь что все зависимости установлены

**Проблема:** "Database connection failed"
**Решение:** Проверьте DATABASE_URL в переменных окружения

**Проблема:** "Migrations failed"
**Решение:**
```bash
# Примените миграции вручную
railway run npx prisma migrate deploy
```

### Приложение не отвечает

1. Проверьте логи: `railway logs`
2. Проверьте переменные: `railway variables`
3. Перезапустите: `railway restart`

---

## Полезные ссылки

- Railway Dashboard: https://railway.app/dashboard
- Neon Dashboard: https://console.neon.tech
- Railway Docs: https://docs.railway.app
- NestJS Docs: https://docs.nestjs.com
