-- =====================================================
-- Migration: Create book_categories and migrate legacy books.category_id
-- Database: book_store
-- =====================================================

CREATE TABLE IF NOT EXISTS `book_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `book_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `book_categories_book_id_category_id_unique` (`book_id`,`category_id`),
  KEY `book_categories_book_id_index` (`book_id`),
  KEY `book_categories_category_id_index` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `book_categories`
  ADD CONSTRAINT `book_categories_book_id_foreign` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `book_categories_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

SET @legacy_book_category_count := (
  SELECT COUNT(*)
  FROM `books`
  WHERE `category_id` IS NOT NULL
);

INSERT IGNORE INTO `book_categories` (`book_id`, `category_id`, `created_at`, `updated_at`)
SELECT `b`.`id`, `b`.`category_id`, NOW(), NOW()
FROM `books` `b`
INNER JOIN `categories` `c` ON `c`.`id` = `b`.`category_id`
WHERE `b`.`category_id` IS NOT NULL;

SET @migrated_book_category_count := (
  SELECT COUNT(*)
  FROM `book_categories` `bc`
  INNER JOIN `books` `b` ON `b`.`id` = `bc`.`book_id`
  WHERE `b`.`category_id` IS NOT NULL
    AND `bc`.`category_id` = `b`.`category_id`
);

SET @migration_message := IF(
  @legacy_book_category_count = @migrated_book_category_count,
  'SELECT 1',
  'SIGNAL SQLSTATE ''45000'' SET MESSAGE_TEXT = ''Book category migration integrity check failed'''
);

PREPARE stmt FROM @migration_message;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- Result:
-- - book_categories created
-- - legacy books.category_id data copied into pivot rows
-- - NULL category_id values ignored
-- - duplicate pivot rows ignored
-- =====================================================