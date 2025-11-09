# Интеграция с фронтендом

## Получение URL для фронтенда

После деплоя на Railway вы получите URL вида:
```
https://your-app-name.up.railway.app
```

Этот URL нужно использовать во фронтенде для всех API запросов.

---

## Вариант 1: Railway (рекомендуется)

### Шаг 1: Деплой на Railway

1. Откройте https://railway.app
2. Login через GitHub
3. New Project → Deploy from GitHub repo
4. Выберите репозиторий `vue-system-crm-backend`
5. Добавьте переменные окружения:

```env
DATABASE_URL=postgresql://neondb_owner:npg_03PERjyhaUfr@ep-flat-grass-adjzu8l9-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

JWT_SECRET=933ff57460e47cc05689e7f2f10c1e6fe583f260d3b53fb6168c2d48c1d156c010dc6d5f5394104c86556c2876c411c34f326437dc37dec3e983460856682ba9

JWT_EXPIRATION=7d

NODE_ENV=production
```

### Шаг 2: Получить URL

1. Откройте ваш сервис в Railway
2. Settings → Domains → Generate Domain
3. Скопируйте URL, например: `https://vue-system-crm-backend-production.up.railway.app`

### Шаг 3: Проверить работу

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

---

## Настройка фронтенда (Vue.js)

### 1. Создайте файл `.env` во фронтенде

```env
# .env.development (для локальной разработки)
VITE_API_URL=http://localhost:3000

# .env.production (для продакшена)
VITE_API_URL=https://ваш-url.up.railway.app
```

### 2. Настройте axios или fetch

**Вариант A: Axios**

```bash
# Установить axios
npm install axios
```

Создайте `src/api/index.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавить токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**Вариант B: Fetch**

Создайте `src/api/index.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL;

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export default apiRequest;
```

---

## Примеры использования API

### 1. Регистрация

```javascript
import api from '@/api';

async function register(userData) {
  try {
    const response = await api.post('/auth/register', {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      birthDate: userData.birthDate, // "1990-01-01"
    });

    // Сохранить токен
    localStorage.setItem('accessToken', response.data.accessToken);

    // Сохранить пользователя
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data);
    throw error;
  }
}
```

### 2. Вход (Login)

```javascript
import api from '@/api';

async function login(email, password) {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    // Сохранить токен
    localStorage.setItem('accessToken', response.data.accessToken);

    // Сохранить пользователя
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data);
    throw error;
  }
}
```

### 3. Получение профиля

```javascript
import api from '@/api';

async function getProfile() {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error.response?.data);

    // Если токен невалидный, разлогинить
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }

    throw error;
  }
}
```

### 4. Выход (Logout)

```javascript
function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  // Редирект на страницу входа
  window.location.href = '/login';
}
```

---

## Пример компонента регистрации (Vue 3)

```vue
<template>
  <div class="register-form">
    <h2>Регистрация</h2>

    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label>Email</label>
        <input
          v-model="form.email"
          type="email"
          required
        />
      </div>

      <div class="form-group">
        <label>Пароль</label>
        <input
          v-model="form.password"
          type="password"
          required
          minlength="6"
        />
      </div>

      <div class="form-group">
        <label>Имя</label>
        <input
          v-model="form.firstName"
          type="text"
          required
        />
      </div>

      <div class="form-group">
        <label>Фамилия</label>
        <input
          v-model="form.lastName"
          type="text"
          required
        />
      </div>

      <div class="form-group">
        <label>Дата рождения</label>
        <input
          v-model="form.birthDate"
          type="date"
          required
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';

const router = useRouter();

const form = ref({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  birthDate: '',
});

const loading = ref(false);
const error = ref('');

async function handleRegister() {
  loading.value = true;
  error.value = '';

  try {
    const response = await api.post('/auth/register', form.value);

    // Сохранить токен и пользователя
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    // Редирект на главную
    router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.message || 'Ошибка регистрации';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
```

---

## Пример компонента входа (Vue 3)

```vue
<template>
  <div class="login-form">
    <h2>Вход</h2>

    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label>Email</label>
        <input
          v-model="email"
          type="email"
          required
        />
      </div>

      <div class="form-group">
        <label>Пароль</label>
        <input
          v-model="password"
          type="password"
          required
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Вход...' : 'Войти' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
    </form>

    <p>
      Нет аккаунта?
      <router-link to="/register">Зарегистрироваться</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';

const router = useRouter();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleLogin() {
  loading.value = true;
  error.value = '';

  try {
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value,
    });

    // Сохранить токен и пользователя
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    // Редирект на главную
    router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.message || 'Неверный email или пароль';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Те же стили что и в регистрации */
</style>
```

---

## Route Guard для защиты страниц

Создайте `src/router/guards.js`:

```javascript
export function authGuard(to, from, next) {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    // Редирект на страницу входа
    next('/login');
  } else {
    next();
  }
}
```

Используйте в роутере:

```javascript
import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from './guards';

const routes = [
  {
    path: '/login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/register',
    component: () => import('@/views/Register.vue'),
  },
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue'),
    beforeEnter: authGuard, // Защищенная страница
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

---

## Обработка ошибок

```javascript
// src/api/index.js
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен истек или невалидный
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Краткая инструкция

### Для начала работы:

1. **Задеплойте backend на Railway** (см. [DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md))
2. **Получите URL** вашего API (например: `https://your-app.up.railway.app`)
3. **Добавьте URL в `.env` фронтенда:**
   ```env
   VITE_API_URL=https://your-app.up.railway.app
   ```
4. **Используйте примеры кода выше** для интеграции

### API endpoints:

- `POST /auth/register` - регистрация
- `POST /auth/login` - вход
- `GET /auth/profile` - получение профиля (требует токен)

### Формат данных:

**Регистрация:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Иван",
  "lastName": "Иванов",
  "birthDate": "1990-01-01"
}
```

**Вход:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ (регистрация и вход):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Иван",
    "lastName": "Иванов",
    "birthDate": "1990-01-01T00:00:00.000Z",
    "createdAt": "2025-01-09T...",
    "updatedAt": "2025-01-09T..."
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Дальнейшая разработка

После базовой интеграции можно добавить:

1. **Pinia store** для управления состоянием пользователя
2. **Автоматическое обновление токена** (refresh tokens)
3. **Восстановление пароля**
4. **Подтверждение email**
5. **Социальные сети** (OAuth)

Но для начала используйте примеры выше - они полностью рабочие!
