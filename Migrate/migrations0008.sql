-- =====================================================
-- Migration: Move legacy books.author_id into book_authors
-- Database: book_store
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1) Copy legacy single-author values into the many-to-many table.
--    Existing relations are preserved; duplicates are ignored.
INSERT IGNORE INTO book_authors (book_id, author_id)
SELECT b.id, b.author_id
FROM books b
INNER JOIN authors a ON a.id = b.author_id
WHERE b.author_id IS NOT NULL;

-- 2) Drop the legacy foreign key on books.author_id only if it exists.
SET @book_author_fk := (
  SELECT CONSTRAINT_NAME
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'books'
    AND COLUMN_NAME = 'author_id'
    AND REFERENCED_TABLE_NAME IS NOT NULL
  LIMIT 1
);

SET @sql := IF(
  @book_author_fk IS NULL,
  'SELECT 1',
  CONCAT('ALTER TABLE `books` DROP FOREIGN KEY `', @book_author_fk, '`')
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3) Remove the legacy column from books if it is still present.
SET @has_author_column := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'books'
    AND COLUMN_NAME = 'author_id'
);

SET @sql := IF(
  @has_author_column = 0,
  'SELECT 1',
  'ALTER TABLE `books` DROP COLUMN `author_id`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4) Re-create the many-to-many foreign keys if they are missing.
SET @missing_book_fk := (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'book_authors'
    AND COLUMN_NAME = 'book_id'
    AND REFERENCED_TABLE_NAME = 'books'
);

SET @missing_author_fk := (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'book_authors'
    AND COLUMN_NAME = 'author_id'
    AND REFERENCED_TABLE_NAME = 'authors'
);

SET @sql := IF(
  @missing_book_fk = 0,
  'ALTER TABLE `book_authors` ADD CONSTRAINT `fk_book_authors_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @missing_author_fk = 0,
  'ALTER TABLE `book_authors` ADD CONSTRAINT `fk_book_authors_author` FOREIGN KEY (`author_id`) REFERENCES `authors` (`id`) ON DELETE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- Result:
-- - legacy books.author_id values are preserved in book_authors
-- - books no longer stores a direct author column
-- - book_authors keeps the many-to-many relation with FKs
-- =====================================================
