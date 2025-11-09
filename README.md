<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

CRM Backend built with NestJS, Prisma, PostgreSQL and JWT authentication.

## Features

- User Registration and Authentication
- JWT-based authorization
- Secure password hashing with bcrypt
- PostgreSQL database with Prisma ORM
- Input validation with class-validator
- Clean architecture with separated modules

## Quick Start

Смотрите подробную инструкцию по запуску в [SETUP.md](SETUP.md)

### Краткая инструкция:

1. Установите зависимости:
```bash
npm install
```

2. Запустите PostgreSQL через Docker:
```bash
docker-compose up -d
```

Или смотрите [SETUP_WITHOUT_DOCKER.md](SETUP_WITHOUT_DOCKER.md) для альтернативных вариантов.

3. Выполните миграции:
```bash
npx prisma migrate dev --name init
```

4. Запустите приложение:
```bash
npm run start:dev
```

Приложение будет доступно на `http://localhost:3000`

## Environment Configuration

Файл [.env](.env) уже создан с настройками по умолчанию:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crm_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "birthDate": "1990-01-01"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "birthDate": "1990-01-01T00:00:00.000Z",
    "createdAt": "2025-01-09T...",
    "updatedAt": "2025-01-09T..."
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "birthDate": "1990-01-01T00:00:00.000Z",
    "createdAt": "2025-01-09T...",
    "updatedAt": "2025-01-09T..."
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Profile (Protected)
```http
GET /auth/profile
Authorization: Bearer {accessToken}
```

Response:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "birthDate": "1990-01-01T00:00:00.000Z",
  "createdAt": "2025-01-09T...",
  "updatedAt": "2025-01-09T..."
}
```

## Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── decorators/          # Custom decorators (CurrentUser)
│   ├── dto/                 # Data Transfer Objects
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   ├── guards/              # Route guards (JwtAuthGuard)
│   ├── strategies/          # Passport strategies (JWT)
│   ├── auth.controller.ts   # Auth endpoints
│   ├── auth.service.ts      # Auth business logic
│   └── auth.module.ts
├── users/                   # Users module
│   ├── entities/            # User entity
│   ├── users.service.ts     # User business logic
│   └── users.module.ts
├── prisma/                  # Prisma module
│   ├── prisma.service.ts    # Prisma client service
│   └── prisma.module.ts
├── app.module.ts            # Root module
└── main.ts                  # Application entry point
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
