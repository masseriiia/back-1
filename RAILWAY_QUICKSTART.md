# Быстрый деплой на Railway.app

Railway - лучший вариант для деплоя NestJS приложений. Бесплатно $5 кредитов в месяц!

## За 5 минут до деплоя

### Вариант 1: Через веб-интерфейс (проще всего)

1. **Зарегистрируйтесь на Railway**
   - Откройте https://railway.app
   - Войдите через GitHub

2. **Создайте новый проект**
   - Нажмите "New Project"
   - Выберите "Deploy from GitHub repo"
   - Выберите репозиторий `vue-system-crm-backend`

3. **Добавьте PostgreSQL**
   - В проекте нажмите "New"
   - Выберите "Database" → "PostgreSQL"
   - Railway автоматически создаст БД и добавит `DATABASE_URL`

4. **Настройте переменные окружения**
   - Откройте ваш backend сервис
   - Перейдите в "Variables"
   - Добавьте:
     ```
     JWT_SECRET=ваш-секретный-ключ-минимум-32-символа
     JWT_EXPIRATION=7d
     NODE_ENV=production
     ```

   Генерация JWT_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

5. **Настройте команды деплоя**
   - Settings → Deploy
   - **Build Command:** (оставьте пустым, Railway автоматически определит)
   - **Start Command:**
     ```bash
     npx prisma migrate deploy && npm run start:prod
     ```
   - Или создайте файл `railway.json`:
     ```json
     {
       "$schema": "https://railway.app/railway.schema.json",
       "build": {
         "builder": "NIXPACKS"
       },
       "deploy": {
         "startCommand": "npx prisma migrate deploy && npm run start:prod",
         "restartPolicyType": "ON_FAILURE",
         "restartPolicyMaxRetries": 10
       }
     }
     ```

6. **Деплой!**
   - Railway автоматически начнет деплой
   - Ждите ~2-3 минуты
   - После деплоя откройте Settings → Domains
   - Нажмите "Generate Domain"
   - Скопируйте URL вашего API

7. **Проверьте работу**
   ```bash
   curl https://your-app.up.railway.app/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "firstName": "Test",
       "lastName": "User",
       "birthDate": "1990-01-01"
     }'
   ```

---

### Вариант 2: Через Railway CLI

```bash
# 1. Установить Railway CLI
npm install -g @railway/cli

# 2. Войти в Railway
railway login

# 3. Инициализировать проект
cd vue-system-crm-backend
railway init

# 4. Добавить PostgreSQL
railway add -d postgres

# 5. Установить переменные окружения
railway variables set JWT_SECRET="ваш-секретный-ключ"
railway variables set JWT_EXPIRATION="7d"
railway variables set NODE_ENV="production"

# 6. Деплой
railway up

# 7. Открыть проект в браузере
railway open
```

---

## Автоматический деплой при push

Railway автоматически настраивает CI/CD:

1. Сделайте изменения в коде
2. Закоммитьте и запуште в GitHub:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```
3. Railway автоматически задеплоит новую версию!

---

## Просмотр логов

### Через веб-интерфейс:
1. Откройте проект в Railway
2. Перейдите в "Deployments"
3. Кликните на активный деплой
4. Смотрите логи в реальном времени

### Через CLI:
```bash
# Просмотр логов в реальном времени
railway logs

# Логи конкретного сервиса
railway logs --service backend
```

---

## Управление базой данных

### Подключение к PostgreSQL

```bash
# Получить connection string
railway variables get DATABASE_URL

# Подключиться через psql
railway connect postgres
```

### Prisma Studio

```bash
# Локально (подключается к Railway БД)
npx prisma studio
```

### Резервное копирование

Railway автоматически делает бэкапы, но можно сделать вручную:

```bash
# Экспорт
railway run pg_dump > backup.sql

# Импорт
railway run psql < backup.sql
```

---

## Мониторинг

### Метрики
- Откройте проект → Metrics
- Смотрите CPU, Memory, Network

### Alertы
- Settings → Notifications
- Настройте уведомления в Telegram/Email

---

## Масштабирование

### Вертикальное (больше ресурсов)
1. Settings → Resources
2. Увеличьте CPU/Memory
3. Сохраните

### Горизонтальное (больше инстансов)
Railway пока не поддерживает автоматическое масштабирование,
но можно запустить несколько сервисов за Load Balancer.

---

## Стоимость

### Бесплатный план:
- $5 кредитов в месяц
- ~500 часов работы в месяц (при минимальных ресурсах)
- Подходит для разработки и малых проектов

### Developer план ($5/мес):
- $5 подписка + usage-based
- Больше ресурсов
- Priority support

### Team план ($20/мес):
- Для команд
- Больше проектов
- Advanced features

Калькулятор: https://railway.app/pricing

---

## Troubleshooting

### Ошибка подключения к БД

```bash
# Проверьте DATABASE_URL
railway variables

# Перезапустите сервис
railway restart
```

### Приложение не запускается

```bash
# Проверьте логи
railway logs

# Проверьте переменные окружения
railway variables
```

### Миграции не применяются

```bash
# Примените вручную
railway run npx prisma migrate deploy

# Проверьте статус
railway run npx prisma migrate status
```

### Превысили лимит кредитов

1. Settings → Usage
2. Посмотрите, что потребляет больше всего
3. Оптимизируйте или обновите план

---

## Полезные команды

```bash
# Статус проекта
railway status

# Список сервисов
railway service list

# Переменные окружения
railway variables

# Выполнить команду в Railway окружении
railway run <command>

# Открыть проект в браузере
railway open

# Удалить проект
railway delete
```

---

## Рекомендации

1. **Используйте Production переменные** для JWT_SECRET
2. **Настройте автобэкапы** БД (в Pro плане)
3. **Мониторьте использование** кредитов
4. **Настройте алерты** на ошибки
5. **Используйте custom domain** для продакшена
6. **Включите health checks** в коде

---

## Следующие шаги

После деплоя можно:

1. Добавить custom domain (Settings → Domains → Add Domain)
2. Настроить CI/CD тесты перед деплоем
3. Добавить мониторинг (Sentry, LogRocket)
4. Настроить rate limiting
5. Добавить кэширование (Redis на Railway)
6. Масштабировать при необходимости

---

## Альтернативы Railway

Если Railway не подходит:
- **Render.com** - похожий сервис, бесплатный план
- **Fly.io** - глобальное размещение
- **Heroku** - классика, но платный
- **DigitalOcean App Platform** - простой VPS
- **AWS Elastic Beanstalk** - для энтерпрайза

Но для NestJS + PostgreSQL **Railway - лучший выбор**!
