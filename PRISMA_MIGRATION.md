# Миграция на Prisma

Я переделал проект на Prisma вместо прямого использования mysql2. Вот что было сделано:

## ✅ Что изменилось:

1. **Создан Prisma schema** (`prisma/schema.prisma`)
   - Все таблицы из базы данных преобразованы в Prisma модели
   - Все отношения и индексы настроены

2. **Создан Prisma клиент** (`lib/prisma.ts`)
   - Оптимизированная инициализация Prisma

3. **Обновлены запросы к БД:**
   - `app/page.tsx` - использует Prisma для популярных книг, новинок и категорий
   - `app/api/books/route.ts` - API endpoint с Prisma вместо raw SQL

4. **Создан .env.local файл**
   - Содержит DATABASE_URL для подключения Prisma к MySQL

## 🚀 Что нужно сделать:

1. **Обновите .env.local** файл с правильным подключением:
   ```
   DATABASE_URL="mysql://root:@localhost:3306/book_store"
   ```
   Если есть пароль:
   ```
   DATABASE_URL="mysql://root:your_password@localhost:3306/book_store"
   ```

2. **Установите Prisma (если не установлена)**:
   ```bash
   npm install @prisma/client
   npm install -D prisma
   ```

3. **Сгенерируйте Prisma клиент**:
   ```bash
   npx prisma generate
   ```

4. **Синхронизируйте схему с БД (опционально)**:
   ```bash
   npx prisma db push
   ```

5. **Запустите проект**:
   ```bash
   npm run dev
   ```

## 📝 Структура Prisma моделей:

- `User` - пользователи (auth0 интеграция)
- `Author` - авторы книг
- `Category` - категории/жанры
- `Book` - книги (основная таблица)
- `CartItem` - товары в корзине
- `Address` - адреса доставки
- `ShippingMethod` - способы доставки
- `Order` - заказы
- `OrderItem` - товары в заказе
- `Review` - отзывы о книгах

## 💡 Преимущества Prisma:

✅ Type-safe запросы к БД
✅ Автоматическая генерация типов
✅ Миграции БД
✅ Удобный ORM синтаксис
✅ Полная интеграция с TypeScript

Теперь весь проект использует Prisma вместо прямого MySQL подключения! 🎉
