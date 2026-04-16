# RaamatuPood - Online Bookstore

**Современная экосистема для продажи книг онлайн. Полнофункциональное приложение с аутентификацией, корзиной товаров, оплатой и админ-панелью.**

![Next.js 16](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=nextdotjs)
![React 19](https://img.shields.io/badge/React-19.2.3-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue?style=flat-square&logo=mysql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=flat-square&logo=tailwindcss)
![Auth0](https://img.shields.io/badge/Auth0-Social%20Login-black?style=flat-square)
![Stripe](https://img.shields.io/badge/Stripe-Payments-008CDD?style=flat-square)

## 📋 Оглавление

- [Особенности](#-особенности)
- [Требования](#-требования)
- [Установка](#-установка)
- [Конфигурация](#-конфигурация)
- [Структура проекта](#-структура-проекта)
- [Технологический стек](#-технологический-стек)
- [API Endpoints](#-api-endpoints)
- [Запуск](#-запуск)
- [Развертывание](#-развертывание)
- [Документация](#-документация)

## 🎯 Особенности

### Функционал пользователя
- 🔐 **Аутентификация** - Auth0 интеграция для безопасного входа
- 📚 **Каталог книг** - Полнотекстовый поиск и фильтрация по категориям
- ⭐ **Рецензии** - Система оценок и отзывов от пользователей
- 🛒 **Корзина товаров** - Сессионное хранилище с синхронизацией
- 💳 **Оплата** - Интеграция со Stripe для безопасных платежей
- 👤 **Профиль** - Управление профилем и аватаром
- 📦 **Заказы** - История заказов и отслеживание статуса
- 🚚 **Доставка** - Выбор способов доставки и расчет стоимости

### Функционал администратора
- 📊 **Аналитическая панель** - Статистика продаж и посещений
- 📕 **Управление книгами** - CRUD операции с каталогом
- 👥 **Управление пользователями** - Просмотр и управление аккаунтами
- 📋 **Управление заказами** - Отслеживание и управление статусом
- 🏪 **Управление категориями** - Организация каталога

### Безопасность
- 🛡️ **Rate Limiting** - Защита от DDoS и перебора пароля
- 🤖 **Bot Detection** - Обнаружение подозрительной активности
- 🔐 **CSRF Protection** - Защита от межсайтовых запросов
- 📍 **IP Validation** - Проверка источников запросов
- 🚨 **Brute Force Protection** - Ограничение попыток входа

## 📦 Требования

- **Node.js** >= 18.0.0
- **npm** или **yarn**
- **MySQL** >= 8.0
- **Аккаунты сервисов:**
  - Auth0 (для аутентификации)
  - Stripe (для платежей)

## 🚀 Установка

### 1. Клонирование и зависимости

```bash
# Клонировать репозиторий
git clone <repository-url>
cd RaamatuPood

# Установить зависимости
npm install
```

### 2. Конфигурация базы данных

Создать файл `.env.local` в корне проекта:

```env
# ===== DATABASE =====
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=book_store

# ===== DATABASE URL (для Prisma) =====
DATABASE_URL="mysql://root:password@localhost:3306/book_store"

# ===== AUTH0 =====
AUTH0_SECRET=generated-secret-key
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# ===== STRIPE =====
STRIPE_PUBLIC_KEY=pk_test_your-key
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret

# ===== APP =====
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Инициализация базы данных

```bash
# Создать таблицы и заполнить начальные данные
npm run db:init

# (Опционально) Заполнить тестовых пользователей
npm run db:seed-users
```

### 4. Синхронизация Prisma

```bash
# Синхронизировать схему БД с Prisma
npx prisma db push

# Генерировать Prisma Client
npx prisma generate
```

## ⚙️ Конфигурация

### Auth0 Setup

1. Создать приложение в Auth0 Dashboard
2. Настроить **Allowed Callback URLs**:
   ```
   http://localhost:3000/api/auth/callback
   ```
3. Настроить **Allowed Logout URLs**:
   ```
   http://localhost:3000
   ```
4. Включить **Post-login flow** в `auth0/actions/post-login.js`

### Stripe Setup

1. Создать API ключи в Stripe Dashboard
2. Настроить Webhook для события `checkout.session.completed`
3. Webhook URL: `https://yourdomain.com/api/webhooks/stripe`

### MySQL Database

Структура основных таблиц:
- `books` - Каталог книг
- `categories` - Категории
- `users` - Пользователи
- `orders` - Заказы
- `order_items` - Позиции заказов
- `reviews` - Отзывы и оценки
- `cart_items` - Товары в корзине
- `shipping_methods` - Методы доставки

Все скрипты миграции находятся в папке `Migrate/`

## 📁 Структура проекта

```
RaamatuPood/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── admin/               # Админ endpoints
│   │   ├── auth/                # Аутентификация
│   │   ├── books/               # Каталог книг
│   │   ├── cart/                # Корзина
│   │   ├── checkout/            # Оплата
│   │   ├── orders/              # Заказы
│   │   ├── reviews/             # Отзывы
│   │   └── webhooks/            # Webhooks (Stripe)
│   ├── account/                 # Профиль пользователя
│   ├── admin/                   # Админ-панель
│   ├── catalog/                 # Публичный каталог
│   ├── checkout/                # Оформление заказа
│   ├── auth/                    # Auth0 маршруты
│   └── [page].tsx              # Главные страницы
├── auth0/                        # Auth0 конфигурация
│   └── actions/                 # Post-login flow
├── components/                   # React компоненты
│   ├── BookCard.tsx            # Карточка книги
│   ├── CartDrawer.tsx          # Боковая панель корзины
│   ├── Header.tsx              # Навигация
│   └── admin/                  # Админ компоненты
├── contexts/                     # React Context
│   └── CartContext.tsx         # Состояние корзины
├── lib/                          # Утилиты и помощники
│   ├── auth/                   # Логика аутентификации
│   ├── cart/                   # Логика корзины
│   ├── checkout/               # Логика платежей
│   ├── security/               # Защита и валидация
│   └── api/                    # API типы
├── prisma/                       # Prisma ORM
│   └── schema.prisma           # Схема БД
├── stores/                       # Zustand хранилища
│   └── cartStore.ts            # Состояние корзины
├── scripts/                      # Вспомогательные скрипты
│   ├── initDb.js               # Инициализация БД
│   └── seedUsers.js            # Заполнение тестовых данных
├── Migrate/                      # SQL миграции
│   └── *.sql                   # Скрипты миграции
├── middleware.ts                 # Next.js middleware
├── next.config.ts              # Конфигурация Next.js
├── tsconfig.json               # TypeScript настройки
├── tailwind.config.ts          # Tailwind CSS
└── .env.local                  # Переменные окружения (добавить)
```

## 🛠️ Технологический стек

### Frontend
- **Next.js 16** - React фреймворк с SSR
- **React 19** - Библиотека UI
- **TypeScript** - Типизация JavaScript
- **Tailwind CSS 4** - Утилиты CSS
- **Zustand** - Управление состоянием
- **Recharts** - Графики и диаграммы

### Backend
- **Next.js API Routes** - Serverless функции
- **Prisma** - ORM для БД
- **Stripe SDK** - Интеграция платежей
- **Auth0** - Управление аутентификацией

### База данных
- **MySQL 8** - Реляционная БД
- **mysql2** - Драйвер MySQL

### Безопасность
- **Rate Limiting** - rateLimit middleware
- **Bot Detection** - detectBot middleware
- **CSRF Protection** - Валидация токенов
- **Brute Force Protection** - Мониторинг попыток

## 🔌 API Endpoints

### Аутентификация
- `GET /api/auth/login` - Вход через Auth0
- `GET /api/auth/logout` - Выход
- `GET /api/auth/callback` - Callback Auth0
- `GET /api/auth/status` - Проверка статуса

### Каталог
- `GET /api/books` - Список книг
- `GET /api/books?search=query` - Поиск книг
- `GET /api/categories` - Все категории

### Корзина
- `GET /api/cart` - Содержимое корзины
- `POST /api/cart` - Добавить товар
- `DELETE /api/cart/[bookId]` - Удалить товар

### Заказы
- `GET /api/orders` - История заказов пользователя
- `POST /api/checkout` - Создать платеж
- `GET /api/orders/[id]` - Детали заказа

### Профиль
- `POST /api/profile/avatar` - Загрузить аватар
- `POST /api/profile/setup` - Завершить профиль

### Админ
- `GET /api/admin/books` - Управление книгами
- `GET /api/admin/orders` - Управление заказами
- `GET /api/admin/users` - Управление пользователями

### Webhooks
- `POST /api/webhooks/stripe` - Stripe события

## ▶️ Запуск

### Режим разработки

```bash
# Запустить dev сервер с горячей перезагрузкой
npm run dev

# Приложение будет доступно на http://localhost:3000
```

### Production Build

```bash
# Собрать приложение
npm run build

# Запустить production версию
npm start
```

### Linting

```bash
# Проверить код на ошибки
npm run lint

# Автоисправить ошибки (если возможно)
npm run lint -- --fix
```

## 📊 Отладка

### Просмотр логов базы данных
```bash
# Включить Prisma Studio
npx prisma studio
```

Откроется веб-интерфейс для просмотра и редактирования данных БД.

## 🚀 Развертывание

### На Vercel (Рекомендуется)

```bash
# Установить Vercel CLI
npm i -g vercel

# Развернуть
vercel
```

### На других платформах

1. **Переменные окружения**
   - Установить все переменные из `.env.local` в environment variables хостинга

2. **База данных**
   - Развернуть MySQL на облачном хостинге (AWS RDS, PlanetScale и т.д.)
   - Обновить `DATABASE_URL` в переменных окружения

3. **Build**
   ```bash
   npm run build
   npm start
   ```

4. **Домен и SSL**
   - Указать домен в Auth0 и Stripe конфигурации
   - Убедиться в HTTPS

## 📚 Документация

- [DB_SETUP.md](DB_SETUP.md) - Настройка базы данных
- [NEXT_JS_16_MIGRATION.md](NEXT_JS_16_MIGRATION.md) - Особенности Next.js 16
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Auth0 Documentation](https://auth0.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🐛 Troubleshooting

### Ошибка: "Database connection failed"
```bash
# Проверить переменные БД в .env.local
# Убедиться, что MySQL запущен
# Синхронизировать schema: npx prisma db push
```

### Ошибка: "Auth0 login не работает"
```bash
# Проверить AUTH0_* переменные в .env.local
# Перезагрузить dev сервер: npm run dev
```

### Ошибка: "Stripe webhook не срабатывает"
```bash
# Использовать Stripe CLI для локального тестирования:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 📝 Лицензия

MIT

## 👨‍💻 Разработка

Создано для демонстрации полнофункционального e-commerce приложения с современным технологическим стеком.

---


