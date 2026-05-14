-- =====================================================
-- Migration: Create languages table
-- Database: book_store
-- =====================================================

CREATE TABLE IF NOT EXISTS `languages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default languages
INSERT IGNORE INTO `languages` (`name`) VALUES 
  ('English'),
  ('Estonian'),
  ('Russian'),
  ('Unknown');

-- =====================================================
-- Result:
-- - Created 'languages' table with id and unique name
-- - Added default languages
-- =====================================================
