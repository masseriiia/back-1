# Архитектура проекта

## Обзор

Проект построен на основе NestJS с использованием модульной архитектуры и следующих принципов:
- Разделение ответственности (Separation of Concerns)
- Dependency Injection
- Layered Architecture

## Модули

### 1. PrismaModule
Глобальный модуль для работы с базой данных через Prisma ORM.

**Файлы:**
- [src/prisma/prisma.service.ts](src/prisma/prisma.service.ts) - Сервис для подключения к БД
- [src/prisma/prisma.module.ts](src/prisma/prisma.module.ts) - Модуль Prisma

### 2. UsersModule
Модуль для управления пользователями.

**Файлы:**
- [src/users/users.service.ts](src/users/users.service.ts) - Бизнес-логика пользователей
- [src/users/users.module.ts](src/users/users.module.ts) - Модуль пользователей
- [src/users/entities/user.entity.ts](src/users/entities/user.entity.ts) - Сущность пользователя с исключением пароля

**Основные методы:**
- `create()` - Создание пользователя с хешированием пароля
- `findByEmail()` - Поиск пользователя по email
- `findById()` - Поиск пользователя по ID
- `validatePassword()` - Проверка пароля

### 3. AuthModule
Модуль аутентификации и авторизации.

**Файлы:**
- [src/auth/auth.service.ts](src/auth/auth.service.ts) - Бизнес-логика аутентификации
- [src/auth/auth.controller.ts](src/auth/auth.controller.ts) - Контроллер с endpoints
- [src/auth/auth.module.ts](src/auth/auth.module.ts) - Модуль аутентификации

**DTOs:**
- [src/auth/dto/register.dto.ts](src/auth/dto/register.dto.ts) - DTO для регистрации
- [src/auth/dto/login.dto.ts](src/auth/dto/login.dto.ts) - DTO для входа

**Стратегии:**
- [src/auth/strategies/jwt.strategy.ts](src/auth/strategies/jwt.strategy.ts) - JWT стратегия Passport

**Guards:**
- [src/auth/guards/jwt-auth.guard.ts](src/auth/guards/jwt-auth.guard.ts) - Guard для защиты роутов

**Декораторы:**
- [src/auth/decorators/current-user.decorator.ts](src/auth/decorators/current-user.decorator.ts) - Декоратор для получения текущего пользователя

## Безопасность

### Хеширование паролей
Используется `bcrypt` с salt rounds = 10 для безопасного хранения паролей.

### JWT токены
- Токены подписываются с использованием секретного ключа из переменных окружения
- Срок действия токена настраивается через `JWT_EXPIRATION`
- Токены передаются в заголовке `Authorization: Bearer <token>`

### Валидация данных
- Используется `class-validator` для проверки входящих данных
- Глобальный `ValidationPipe` активирован в [src/main.ts](src/main.ts)
- `whitelist: true` - удаляет неизвестные поля
- `forbidNonWhitelisted: true` - выбрасывает ошибку при неизвестных полях

## База данных

### Схема Prisma
Файл: [prisma/schema.prisma](prisma/schema.prisma)

**Модель User:**
- `id` - UUID, первичный ключ
- `email` - Уникальный email
- `password` - Хешированный пароль
- `firstName` - Имя
- `lastName` - Фамилия
- `birthDate` - Дата рождения
- `createdAt` - Дата создания
- `updatedAt` - Дата обновления

## Поток аутентификации

### Регистрация
1. Клиент отправляет POST запрос на `/auth/register`
2. DTO валидируется через `class-validator`
3. Проверяется уникальность email
4. Пароль хешируется с помощью bcrypt
5. Пользователь сохраняется в БД
6. Генерируется JWT токен
7. Возвращается пользователь и токен

### Вход
1. Клиент отправляет POST запрос на `/auth/login`
2. DTO валидируется
3. Находится пользователь по email
4. Проверяется пароль
5. Генерируется JWT токен
6. Возвращается пользователь и токен

### Доступ к защищенным роутам
1. Клиент отправляет запрос с заголовком `Authorization: Bearer <token>`
2. `JwtAuthGuard` проверяет токен
3. `JwtStrategy` валидирует payload и загружает пользователя
4. Пользователь доступен через декоратор `@CurrentUser()`

## Использование в других модулях

### Защита роута
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CurrentUser } from './auth/decorators/current-user.decorator';
import { UserEntity } from './users/entities/user.entity';

@Get('protected')
@UseGuards(JwtAuthGuard)
getProtectedData(@CurrentUser() user: UserEntity) {
  return { message: `Hello ${user.firstName}` };
}
```

## Переменные окружения

Файл: [.env](.env)

- `DATABASE_URL` - URL подключения к PostgreSQL
- `JWT_SECRET` - Секретный ключ для подписи JWT
- `JWT_EXPIRATION` - Срок действия токена (например: "7d", "24h")
