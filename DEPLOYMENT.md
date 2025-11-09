# Деплой на сервер

## Вариант 1: VPS/VDS (Ubuntu/Debian)

### Предварительные требования

- Сервер с Ubuntu 20.04+ или Debian 11+
- Root доступ или sudo
- Доменное имя (опционально, но рекомендуется)

### Шаг 1: Подготовка сервера

```bash
# Обновить систему
sudo apt update && sudo apt upgrade -y

# Установить необходимые пакеты
sudo apt install -y curl git nginx postgresql postgresql-contrib

# Установить Node.js (v20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Проверить установку
node --version
npm --version
```

### Шаг 2: Настройка PostgreSQL

```bash
# Переключиться на пользователя postgres
sudo -u postgres psql

# В psql выполнить:
CREATE USER crm_user WITH PASSWORD 'strong_password_here';
CREATE DATABASE crm_db OWNER crm_user;
GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;
\q

# Разрешить локальные подключения
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Добавить строку:
# local   crm_db          crm_user                                md5

# Перезапустить PostgreSQL
sudo systemctl restart postgresql
```

### Шаг 3: Клонирование проекта

```bash
# Создать пользователя для приложения
sudo adduser crm --disabled-password
sudo su - crm

# Клонировать репозиторий
git clone https://github.com/your-username/vue-system-crm-backend.git
cd vue-system-crm-backend

# Установить зависимости
npm install
```

### Шаг 4: Настройка переменных окружения

```bash
# Создать production .env
nano .env
```

Содержимое .env для production:

```env
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="postgresql://crm_user:strong_password_here@localhost:5432/crm_db?schema=public"

# JWT (ОБЯЗАТЕЛЬНО измените на случайную строку!)
JWT_SECRET="ваш-супер-секретный-ключ-минимум-32-символа"
JWT_EXPIRATION="7d"
```

Генерация безопасного JWT_SECRET:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Шаг 5: Миграции и сборка

```bash
# Применить миграции
npx prisma migrate deploy

# Собрать проект
npm run build

# Проверить, что все работает
npm run start:prod
# Нажмите Ctrl+C для остановки
```

### Шаг 6: Настройка PM2 (Process Manager)

```bash
# Установить PM2 глобально
sudo npm install -g pm2

# Создать ecosystem файл
nano ecosystem.config.js
```

Содержимое ecosystem.config.js:

```javascript
module.exports = {
  apps: [{
    name: 'crm-backend',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
  }]
}
```

```bash
# Создать директорию для логов
mkdir logs

# Запустить приложение
pm2 start ecosystem.config.js

# Настроить автозапуск при перезагрузке
pm2 startup
pm2 save

# Полезные команды PM2:
pm2 status          # Статус приложений
pm2 logs            # Просмотр логов
pm2 restart crm-backend
pm2 reload crm-backend
pm2 stop crm-backend
pm2 delete crm-backend
```

### Шаг 7: Настройка Nginx (Reverse Proxy)

```bash
# Выйти из пользователя crm
exit

# Создать конфигурацию Nginx
sudo nano /etc/nginx/sites-available/crm-backend
```

Содержимое конфигурации:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Замените на ваш домен

    # Ограничение размера загружаемых файлов
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Активировать конфигурацию
sudo ln -s /etc/nginx/sites-available/crm-backend /etc/nginx/sites-enabled/

# Проверить конфигурацию
sudo nginx -t

# Перезапустить Nginx
sudo systemctl restart nginx
```

### Шаг 8: Настройка SSL (HTTPS)

```bash
# Установить Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получить SSL сертификат
sudo certbot --nginx -d your-domain.com

# Автопродление будет настроено автоматически
# Проверить:
sudo certbot renew --dry-run
```

### Шаг 9: Настройка Firewall

```bash
# Установить UFW
sudo apt install -y ufw

# Разрешить SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Включить firewall
sudo ufw enable

# Проверить статус
sudo ufw status
```

---

## Вариант 2: Docker + Docker Compose на сервере

### Создание Dockerfile для production

```bash
nano Dockerfile
```

Содержимое Dockerfile:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build
RUN npx prisma generate

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### Обновление docker-compose.yml для production

```bash
nano docker-compose.prod.yml
```

Содержимое:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: crm_postgres
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-crm_db}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - crm_network

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: crm_backend
    restart: always
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-crm_db}?schema=public
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRATION: ${JWT_EXPIRATION:-7d}
    depends_on:
      - postgres
    networks:
      - crm_network
    command: sh -c "npx prisma migrate deploy && npm run start:prod"

volumes:
  postgres_data:

networks:
  crm_network:
    driver: bridge
```

### Деплой с Docker

```bash
# На сервере
git clone https://github.com/your-username/vue-system-crm-backend.git
cd vue-system-crm-backend

# Создать .env для docker-compose
nano .env
```

```env
POSTGRES_USER=crm_user
POSTGRES_PASSWORD=strong_password_here
POSTGRES_DB=crm_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=7d
```

```bash
# Запустить
docker-compose -f docker-compose.prod.yml up -d

# Проверить логи
docker-compose -f docker-compose.prod.yml logs -f

# Остановить
docker-compose -f docker-compose.prod.yml down

# Обновление приложения
git pull
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## Вариант 3: Cloud платформы (PaaS)

### Railway.app

1. Зарегистрируйтесь на https://railway.app
2. Создайте новый проект
3. Добавьте PostgreSQL сервис
4. Добавьте GitHub репозиторий
5. Настройте переменные окружения:
   - `DATABASE_URL` (автоматически из PostgreSQL)
   - `JWT_SECRET`
   - `JWT_EXPIRATION`
6. Railway автоматически соберет и запустит приложение

### Render.com

1. Зарегистрируйтесь на https://render.com
2. Создайте новую PostgreSQL базу
3. Создайте новый Web Service
4. Подключите GitHub репозиторий
5. Настройки:
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npx prisma migrate deploy && npm run start:prod`
6. Добавьте переменные окружения

### Heroku

```bash
# Установить Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Войти
heroku login

# Создать приложение
heroku create crm-backend-app

# Добавить PostgreSQL
heroku addons:create heroku-postgresql:mini

# Настроить переменные
heroku config:set JWT_SECRET="your-secret-key"
heroku config:set JWT_EXPIRATION="7d"

# Создать Procfile
echo "web: npx prisma migrate deploy && npm run start:prod" > Procfile

# Деплой
git push heroku main
```

### DigitalOcean App Platform

1. Зарегистрируйтесь на https://www.digitalocean.com
2. Создайте новое приложение из GitHub
3. Добавьте PostgreSQL базу данных (Managed Database)
4. Настройки деплоя:
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Run Command: `npx prisma migrate deploy && npm run start:prod`
5. Добавьте переменные окружения

---

## Мониторинг и обслуживание

### Логи

```bash
# PM2
pm2 logs crm-backend

# Docker
docker-compose logs -f backend

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Резервное копирование базы данных

```bash
# Создать backup
pg_dump -U crm_user -h localhost crm_db > backup_$(date +%Y%m%d).sql

# Восстановить
psql -U crm_user -h localhost crm_db < backup_20250109.sql

# Автоматический backup (cron)
crontab -e
# Добавить:
# 0 2 * * * pg_dump -U crm_user -h localhost crm_db > /backups/crm_$(date +\%Y\%m\%d).sql
```

### Обновление приложения

```bash
# С PM2
cd /home/crm/vue-system-crm-backend
git pull
npm install
npm run build
npx prisma migrate deploy
pm2 reload crm-backend

# С Docker
cd /path/to/project
git pull
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## Рекомендации по безопасности

1. **Всегда используйте HTTPS** (SSL сертификат)
2. **Используйте сильные пароли** для БД и JWT_SECRET
3. **Настройте firewall** (UFW)
4. **Регулярно обновляйте** систему и зависимости
5. **Включите fail2ban** для защиты от брутфорса
6. **Ограничьте доступ к БД** только с localhost
7. **Используйте environment variables**, не храните секреты в коде
8. **Настройте регулярные бэкапы** БД
9. **Мониторьте логи** на подозрительную активность
10. **Используйте rate limiting** для API endpoints

### Установка fail2ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Rate Limiting в NestJS

Установите пакет:
```bash
npm install @nestjs/throttler
```

Добавьте в app.module.ts:
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    // ... другие модули
  ],
})
```

---

## Проверка после деплоя

```bash
# Проверить доступность API
curl https://your-domain.com/auth/profile

# Проверить регистрацию
curl -X POST https://your-domain.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "birthDate": "1990-01-01"
  }'
```
