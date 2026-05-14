-- =====================================================
-- Migration: Store book cover images in the database
-- Database: book_store
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `books`
  ADD COLUMN `cover_image_data` LONGBLOB NULL AFTER `cover_image`,
  ADD COLUMN `cover_image_mime_type` VARCHAR(100) NULL AFTER `cover_image_data`;

CREATE TABLE IF NOT EXISTS `pending_book_cover_uploads` (
  `id` VARCHAR(191) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `data` LONGBLOB NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- Result:
-- - book covers uploaded as files are stored in `books.cover_image_data`
-- - temporary upload blobs are stored in `pending_book_cover_uploads`
-- - no filesystem upload path is required for book images
-- =====================================================
