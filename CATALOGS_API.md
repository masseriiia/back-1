# Catalogs API Documentation

## Обзор

Модуль `/catalogs` предоставляет CRUD операции для управления категориями.

**Публичные endpoints (без авторизации):**
- `GET /catalogs` - получить все категории
- `GET /catalogs/active` - получить активные категории
- `GET /catalogs/:id` - получить одну категорию

**Защищенные endpoints (требуют JWT токен):**
- `POST /catalogs` - создать категорию
- `PATCH /catalogs/:id` - обновить категорию
- `DELETE /catalogs/:id` - удалить категорию

## Endpoints

### 1. Создать категорию

```http
POST /catalogs
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "name": "Электроника",
  "description": "Категория для электронных товаров",
  "icon": "⚡",
  "color": "#3B82F6",
  "isActive": true
}
```

**Ответ:**
```json
{
  "id": "uuid",
  "name": "Электроника",
  "description": "Категория для электронных товаров",
  "icon": "⚡",
  "color": "#3B82F6",
  "isActive": true,
  "createdAt": "2025-01-09T...",
  "updatedAt": "2025-01-09T..."
}
```

**Валидация:**
- `name` - обязательное, строка, макс 100 символов, уникальное
- `description` - опциональное, строка, макс 500 символов
- `icon` - опциональное, строка (эмодзи или название иконки)
- `color` - опциональное, строка (HEX цвет)
- `isActive` - опциональное, boolean (по умолчанию `true`)

---

### 2. Получить все категории (Публичный endpoint)

```http
GET /catalogs
```

**Авторизация НЕ требуется**

**Ответ:**
```json
[
  {
    "id": "uuid-1",
    "name": "Электроника",
    "description": "Категория для электронных товаров",
    "icon": "⚡",
    "color": "#3B82F6",
    "isActive": true,
    "createdAt": "2025-01-09T...",
    "updatedAt": "2025-01-09T..."
  },
  {
    "id": "uuid-2",
    "name": "Одежда",
    "description": "Категория для одежды",
    "icon": "👕",
    "color": "#10B981",
    "isActive": true,
    "createdAt": "2025-01-09T...",
    "updatedAt": "2025-01-09T..."
  }
]
```

---

### 3. Получить только активные категории

```http
GET /catalogs/active
Authorization: Bearer <your_token>
```

**Ответ:** Массив категорий где `isActive === true`, отсортированных по имени

---

### 4. Получить одну категорию по ID

```http
GET /catalogs/:id
Authorization: Bearer <your_token>
```

**Пример:**
```http
GET /catalogs/550e8400-e29b-41d4-a716-446655440000
```

**Ответ:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Электроника",
  "description": "Категория для электронных товаров",
  "icon": "⚡",
  "color": "#3B82F6",
  "isActive": true,
  "createdAt": "2025-01-09T...",
  "updatedAt": "2025-01-09T..."
}
```

**Ошибки:**
- 404 - категория не найдена

---

### 5. Обновить категорию

```http
PATCH /catalogs/:id
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "name": "Электроника и гаджеты",
  "color": "#6366F1"
}
```

**Ответ:** Обновленная категория

**Примечания:**
- Можно обновлять только нужные поля (partial update)
- Проверяется уникальность имени

---

### 6. Удалить категорию

```http
DELETE /catalogs/:id
Authorization: Bearer <your_token>
```

**Ответ:** 204 No Content

**Ошибки:**
- 404 - категория не найдена

---

## Примеры использования

### Создание 5 категорий

```bash
# 1. Получить токен (сначала залогиньтесь)
TOKEN="your_access_token_here"

# 2. Создать категории
curl -X POST http://localhost:3000/catalogs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Электроника",
    "description": "Электронные устройства и гаджеты",
    "icon": "⚡",
    "color": "#3B82F6"
  }'

curl -X POST http://localhost:3000/catalogs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Одежда",
    "description": "Одежда и аксессуары",
    "icon": "👕",
    "color": "#10B981"
  }'

curl -X POST http://localhost:3000/catalogs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Продукты",
    "description": "Продукты питания",
    "icon": "🍎",
    "color": "#F59E0B"
  }'

curl -X POST http://localhost:3000/catalogs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Книги",
    "description": "Книги и журналы",
    "icon": "📚",
    "color": "#8B5CF6"
  }'

curl -X POST http://localhost:3000/catalogs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Спорт",
    "description": "Спортивные товары",
    "icon": "⚽",
    "color": "#EF4444"
  }'
```

### Получить все категории

```bash
curl http://localhost:3000/catalogs \
  -H "Authorization: Bearer $TOKEN"
```

### Обновить категорию

```bash
curl -X PATCH http://localhost:3000/catalogs/<category_id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Обновленное описание",
    "isActive": false
  }'
```

### Удалить категорию

```bash
curl -X DELETE http://localhost:3000/catalogs/<category_id> \
  -H "Authorization: Bearer $TOKEN"
```

---

## Интеграция с фронтендом (Vue.js)

### Создание категории

```javascript
import api from '@/api';

async function createCategory(categoryData) {
  try {
    const response = await api.post('/catalogs', {
      name: categoryData.name,
      description: categoryData.description,
      icon: categoryData.icon,
      color: categoryData.color,
      isActive: categoryData.isActive ?? true,
    });

    return response.data;
  } catch (error) {
    console.error('Create category error:', error.response?.data);
    throw error;
  }
}
```

### Получение всех категорий

```javascript
async function getAllCategories() {
  try {
    const response = await api.get('/catalogs');
    return response.data;
  } catch (error) {
    console.error('Get categories error:', error.response?.data);
    throw error;
  }
}
```

### Получение активных категорий

```javascript
async function getActiveCategories() {
  try {
    const response = await api.get('/catalogs/active');
    return response.data;
  } catch (error) {
    console.error('Get active categories error:', error.response?.data);
    throw error;
  }
}
```

### Обновление категории

```javascript
async function updateCategory(id, updates) {
  try {
    const response = await api.patch(`/catalogs/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Update category error:', error.response?.data);
    throw error;
  }
}
```

### Удаление категории

```javascript
async function deleteCategory(id) {
  try {
    await api.delete(`/catalogs/${id}`);
  } catch (error) {
    console.error('Delete category error:', error.response?.data);
    throw error;
  }
}
```

---

## Пример компонента Vue (Список категорий)

```vue
<template>
  <div class="categories-list">
    <h2>Категории</h2>

    <button @click="showCreateForm = true">Создать категорию</button>

    <div v-if="loading">Загрузка...</div>

    <ul v-else>
      <li v-for="category in categories" :key="category.id" class="category-item">
        <span class="icon">{{ category.icon }}</span>
        <span class="name">{{ category.name }}</span>
        <span class="description">{{ category.description }}</span>
        <span
          class="color-badge"
          :style="{ backgroundColor: category.color }"
        ></span>
        <button @click="editCategory(category)">Редактировать</button>
        <button @click="deleteCategory(category.id)">Удалить</button>
      </li>
    </ul>

    <!-- Form для создания/редактирования -->
    <div v-if="showCreateForm" class="modal">
      <!-- Форма... -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api';

const categories = ref([]);
const loading = ref(false);
const showCreateForm = ref(false);

onMounted(async () => {
  await loadCategories();
});

async function loadCategories() {
  loading.value = true;
  try {
    const response = await api.get('/catalogs');
    categories.value = response.data;
  } catch (error) {
    console.error('Failed to load categories:', error);
  } finally {
    loading.value = false;
  }
}

async function deleteCategory(id) {
  if (!confirm('Удалить категорию?')) return;

  try {
    await api.delete(`/catalogs/${id}`);
    await loadCategories();
  } catch (error) {
    console.error('Failed to delete category:', error);
  }
}
</script>
```

---

## Структура базы данных

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(500),
  icon VARCHAR(255),
  color VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Ошибки

### 400 Bad Request
Невалидные данные в запросе

```json
{
  "statusCode": 400,
  "message": ["name must be a string", "name is required"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
Отсутствует или невалидный токен

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
Категория не найдена

```json
{
  "statusCode": 404,
  "message": "Category with ID xxx not found",
  "error": "Not Found"
}
```

### 409 Conflict
Категория с таким именем уже существует

```json
{
  "statusCode": 409,
  "message": "Category with this name already exists",
  "error": "Conflict"
}
```
