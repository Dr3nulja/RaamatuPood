-- =====================================================
-- Миграция: Очистка данных из всех таблиц, КРОМЕ:
-- authors, books, categories, book_authors
-- СТРУКТУРА ВСЕХ ТАБЛИЦ СОХРАНЯЕТСЯ!
-- =====================================================

-- Отключаем проверку внешних ключей
SET FOREIGN_KEY_CHECKS = 0;

-- Очищаем данные в таблицах (НО НЕ УДАЛЯЕМ САМИ ТАБЛИЦЫ)
-- Правильный порядок: сначала дочерние, потом родительские

DELETE FROM `order_items`;
DELETE FROM `cart_items`;
DELETE FROM `reviews`;
DELETE FROM `wishlist`;
DELETE FROM `orders`;
DELETE FROM `addresses`;
DELETE FROM `shipping_methods`;
DELETE FROM `users`;

-- Включаем обратно проверку внешних ключей
SET FOREIGN_KEY_CHECKS = 1;

-- Сбрасываем AUTO_INCREMENT для очищенных таблиц
ALTER TABLE `order_items` AUTO_INCREMENT = 1;
ALTER TABLE `cart_items` AUTO_INCREMENT = 1;
ALTER TABLE `reviews` AUTO_INCREMENT = 1;
ALTER TABLE `wishlist` AUTO_INCREMENT = 1;
ALTER TABLE `orders` AUTO_INCREMENT = 1;
ALTER TABLE `addresses` AUTO_INCREMENT = 1;
ALTER TABLE `shipping_methods` AUTO_INCREMENT = 1;
ALTER TABLE `users` AUTO_INCREMENT = 1;

-- =====================================================
-- РЕЗУЛЬТАТ:
-- 
-- ✅ ДАННЫЕ СОХРАНЕНЫ: authors, books, categories, book_authors
-- ❌ ДАННЫЕ ОЧИЩЕНЫ: addresses, cart_items, orders, order_items, 
--    reviews, shipping_methods, users, wishlist
-- 
-- ✅ ВСЕ ТАБЛИЦЫ И ИХ СТРУКТУРА СОХРАНЕНЫ!
-- ✅ ВСЕ СВЯЗИ (FOREIGN KEY) СОХРАНЕНЫ!
-- =====================================================