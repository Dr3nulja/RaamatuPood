-- =====================================================
-- Migration: Make language and publication_year mandatory
-- Database: book_store
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Fill NULL values in language with default 'Unknown'
UPDATE `books` 
SET `language` = 'Unknown' 
WHERE `language` IS NULL;

-- 2. Fill NULL values in publication_year with default 1900
UPDATE `books` 
SET `publication_year` = 1900 
WHERE `publication_year` IS NULL;

-- 3. Make language NOT NULL with VARCHAR(50)
ALTER TABLE `books` 
  MODIFY COLUMN `language` VARCHAR(50) NOT NULL DEFAULT 'Unknown';

-- 4. Make publication_year NOT NULL with INT
ALTER TABLE `books` 
  MODIFY COLUMN `publication_year` INT NOT NULL DEFAULT 1900;

-- 5. Ensure title is NOT NULL (should already be, but verify)
ALTER TABLE `books` 
  MODIFY COLUMN `title` VARCHAR(255) NOT NULL;

-- 6. Ensure price is NOT NULL with DECIMAL(10,2)
ALTER TABLE `books` 
  MODIFY COLUMN `price` DECIMAL(10, 2) NOT NULL;

-- 7. Ensure stock is NOT NULL with default 0
ALTER TABLE `books` 
  MODIFY COLUMN `stock` INT NOT NULL DEFAULT 0;

-- 8. Ensure description can be NULL (already is, keep as optional TEXT)
ALTER TABLE `books` 
  MODIFY COLUMN `description` TEXT NULL;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- Result:
-- - language is NOT NULL, defaults to 'Unknown'
-- - publication_year is NOT NULL, defaults to 1900
-- - title, price, stock are all NOT NULL
-- - description remains optional (can be NULL)
-- - categoryId remains optional (one book can have no category)
-- - category_id foreign key is preserved
-- =====================================================
