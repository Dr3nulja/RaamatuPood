-- Store user avatars in DB as data URLs (base64), not file paths.
ALTER TABLE `users`
  MODIFY COLUMN `picture` LONGTEXT NULL;
