# Инструкция по запуску проекта

## Предварительные требования

- Node.js (v18 или выше)
- Docker и Docker Compose (для базы данных)
- npm или yarn

## Шаг 1: Установка зависимостей

```bash
npm install
```

## Шаг 2: Запуск базы данных PostgreSQL

### Используя Docker (рекомендуется)

```bash
# Запустить PostgreSQL в контейнере
docker-compose up -d

# Проверить, что контейнер запущен
docker ps
```

База данных будет доступна на `localhost:5432`:
- Пользователь: `postgres`
- Пароль: `postgres`
- База данных: `crm_db`

### Используя локальную установку PostgreSQL

Если у вас уже установлен PostgreSQL локально:

1. Создайте базу данных:
```sql
CREATE DATABASE crm_db;
```

2. Обновите [.env](.env) с вашими параметрами подключения

## Шаг 3: Настройка переменных окружения

Файл [.env](.env) уже создан с настройками по умолчанию:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crm_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"
```

**Важно:** Для продакшена обязательно измените `JWT_SECRET` на случайную строку!

## Шаг 4: Выполнение миграций базы данных

```bash
# Создать и применить миграцию
npx prisma migrate dev --name init

# Сгенерировать Prisma Client
npx prisma generate
```

## Шаг 5: Запуск приложения

```bash
# Режим разработки (с автоперезагрузкой)
npm run start:dev

# Или обычный режим
npm run start
```

Приложение будет доступно на `http://localhost:3000`

## Шаг 6: Тестирование API

### Регистрация пользователя

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Иван",
    "lastName": "Иванов",
    "birthDate": "1990-01-01"
  }'
```

### Вход

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Сохраните полученный `accessToken` из ответа.

### Получение профиля (защищенный роут)

```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## Полезные команды

### Prisma

```bash
# Открыть Prisma Studio (GUI для базы данных)
npx prisma studio

# Сбросить базу данных
npx prisma migrate reset

# Создать новую миграцию
npx prisma migrate dev --name migration_name

# Применить миграции в продакшене
npx prisma migrate deploy
```

### Docker

```bash
# Остановить базу данных
docker-compose down

# Остановить и удалить данные
docker-compose down -v

# Посмотреть логи
docker-compose logs -f postgres

# Подключиться к базе данных через psql
docker exec -it crm_postgres psql -U postgres -d crm_db
```

### NestJS

```bash
# Компиляция проекта
npm run build

# Запуск в продакшен режиме
npm run start:prod

# Линтинг
npm run lint

# Форматирование кода
npm run format

# Тесты
npm run test
npm run test:e2e
npm run test:cov
```

## Решение проблем

### Ошибка подключения к базе данных

```
PrismaClientInitializationError: Can't reach database server at localhost:5432
```

**Решение:**
1. Убедитесь, что Docker контейнер запущен: `docker ps`
2. Проверьте, что порт 5432 свободен: `lsof -i :5432`
3. Перезапустите контейнер: `docker-compose restart`

### Ошибка миграции

```
Database 'crm_db' does not exist
```

**Решение:**
```bash
# Пересоздать базу данных
docker-compose down -v
docker-compose up -d
npx prisma migrate dev --name init
```

### Порт 3000 занят

**Решение:**
Измените порт в [.env](.env):
```env
PORT=3001
```

Или запустите с другим портом:
```bash
PORT=3001 npm run start:dev
```

## Следующие шаги

После успешного запуска вы можете:

1. Изучить [README.md](README.md) для понимания API
2. Прочитать [ARCHITECTURE.md](ARCHITECTURE.md) для понимания архитектуры
3. Начать разработку дополнительных модулей CRM
4. Добавить тесты для критической функциональности
5. Настроить CI/CD для автоматического деплоя
