# Запуск без Docker

Если у вас нет Docker или вы предпочитаете использовать локальную установку PostgreSQL.

## Вариант 1: Установка PostgreSQL на macOS

### Через Homebrew (рекомендуется)

```bash
# Установить PostgreSQL
brew install postgresql@16

# Запустить сервис
brew services start postgresql@16

# Создать базу данных
createdb crm_db
```

### Через Postgres.app

1. Скачайте Postgres.app с https://postgresapp.com/
2. Запустите приложение
3. Создайте новый сервер PostgreSQL
4. Создайте базу данных `crm_db`

## Вариант 2: Использование онлайн-сервиса

### Supabase (бесплатный уровень)

1. Зарегистрируйтесь на https://supabase.com/
2. Создайте новый проект
3. Скопируйте Connection String из Settings → Database
4. Обновите DATABASE_URL в [.env](.env):

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
```

### Neon (бесплатный уровень)

1. Зарегистрируйтесь на https://neon.tech/
2. Создайте новый проект
3. Скопируйте Connection String
4. Обновите DATABASE_URL в [.env](.env)

### Railway (бесплатный уровень)

1. Зарегистрируйтесь на https://railway.app/
2. Создайте новый PostgreSQL сервис
3. Скопируйте DATABASE_URL из переменных окружения
4. Обновите [.env](.env)

## После настройки базы данных

```bash
# Выполнить миграции
npx prisma migrate dev --name init

# Запустить приложение
npm run start:dev
```

## Проверка подключения к PostgreSQL

```bash
# Через psql (если установлен PostgreSQL локально)
psql -h localhost -U postgres -d crm_db

# Через Prisma Studio
npx prisma studio
```
