-- =====================================================
-- Migration: Drop legacy books.category_id after pivot migration
-- Database: book_store
-- =====================================================

SET @book_category_fk := (
  SELECT CONSTRAINT_NAME
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'books'
    AND COLUMN_NAME = 'category_id'
    AND REFERENCED_TABLE_NAME = 'categories'
  LIMIT 1
);

SET @sql := IF(
  @book_category_fk IS NULL,
  'SELECT 1',
  CONCAT('ALTER TABLE `books` DROP FOREIGN KEY `', @book_category_fk, '`')
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @book_category_index := (
  SELECT INDEX_NAME
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'books'
    AND COLUMN_NAME = 'category_id'
    AND NON_UNIQUE = 1
  LIMIT 1
);

SET @sql := IF(
  @book_category_index IS NULL,
  'SELECT 1',
  CONCAT('ALTER TABLE `books` DROP INDEX `', @book_category_index, '`')
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_category_column := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'books'
    AND COLUMN_NAME = 'category_id'
);

SET @sql := IF(
  @has_category_column = 0,
  'SELECT 1',
  'ALTER TABLE `books` DROP COLUMN `category_id`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rollback:
-- Re-add the legacy column and restore the first category per book,
-- using the earliest pivot row by id when multiple categories exist.
--
-- ALTER TABLE `books`
--   ADD COLUMN `category_id` int(11) NULL AFTER `author_id`;
--
-- ALTER TABLE `books`
--   ADD KEY `category_id` (`category_id`),
--   ADD CONSTRAINT `books_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);
--
-- UPDATE `books` `b`
-- INNER JOIN (
--   SELECT `bc`.`book_id`, `bc`.`category_id`
--   FROM `book_categories` `bc`
--   INNER JOIN (
--     SELECT `book_id`, MIN(`id`) AS `first_id`
--     FROM `book_categories`
--     GROUP BY `book_id`
--   ) `first_rows`
--     ON `first_rows`.`book_id` = `bc`.`book_id`
--    AND `first_rows`.`first_id` = `bc`.`id`
-- ) `first_category`
--   ON `first_category`.`book_id` = `b`.`id`
-- SET `b`.`category_id` = `first_category`.`category_id`;

-- =====================================================
-- Result:
-- - category_id removed from books in the forward migration
-- - rollback can restore category_id from book_categories
-- =====================================================