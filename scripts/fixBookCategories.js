const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'book_store',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
  });

  try {
    const [tables] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'book_categories'`
    );

    if (Number(tables[0].count) === 0) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS book_categories (
          id INT(11) NOT NULL AUTO_INCREMENT,
          book_id INT(11) NOT NULL,
          category_id INT(11) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY book_categories_book_id_category_id_unique (book_id, category_id),
          KEY book_categories_book_id_index (book_id),
          KEY book_categories_category_id_index (category_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      await pool.query(`
        ALTER TABLE book_categories
          ADD CONSTRAINT book_categories_book_id_foreign FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
          ADD CONSTRAINT book_categories_category_id_foreign FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
      `);
    }

    await pool.query(`
      DELETE bc1
      FROM book_categories bc1
      INNER JOIN book_categories bc2
        ON bc1.book_id = bc2.book_id
       AND bc1.category_id = bc2.category_id
       AND bc1.id > bc2.id
    `);

    await pool.query(`
      DELETE bc
      FROM book_categories bc
      LEFT JOIN books b ON b.id = bc.book_id
      LEFT JOIN categories c ON c.id = bc.category_id
      WHERE b.id IS NULL OR c.id IS NULL
    `);

    const [columnRows] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'books'
         AND COLUMN_NAME = 'category_id'`
    );

    const hasLegacyColumn = Number(columnRows[0].count) > 0;

    if (hasLegacyColumn) {
      const [legacyCountRows] = await pool.query(
        `SELECT COUNT(*) AS count
         FROM books
         WHERE category_id IS NOT NULL`
      );

      await pool.query(`
        INSERT IGNORE INTO book_categories (book_id, category_id, created_at, updated_at)
        SELECT b.id, b.category_id, NOW(), NOW()
        FROM books b
        INNER JOIN categories c ON c.id = b.category_id
        WHERE b.category_id IS NOT NULL
      `);

      const [migratedRows] = await pool.query(
        `SELECT COUNT(*) AS count
         FROM book_categories bc
         INNER JOIN books b ON b.id = bc.book_id
         WHERE b.category_id IS NOT NULL
           AND bc.category_id = b.category_id`
      );

      if (Number(migratedRows[0].count) !== Number(legacyCountRows[0].count)) {
        throw new Error('Integrity check failed: not all legacy categories were migrated.');
      }
    }

    const [orphanRows] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM book_categories bc
       LEFT JOIN books b ON b.id = bc.book_id
       LEFT JOIN categories c ON c.id = bc.category_id
       WHERE b.id IS NULL OR c.id IS NULL`
    );

    if (Number(orphanRows[0].count) > 0) {
      throw new Error('Integrity check failed: orphan pivot rows remain.');
    }

    const [duplicateRows] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM (
         SELECT book_id, category_id, COUNT(*) AS row_count
         FROM book_categories
         GROUP BY book_id, category_id
         HAVING row_count > 1
       ) duplicates`
    );

    if (Number(duplicateRows[0].count) > 0) {
      throw new Error('Integrity check failed: duplicate pivot rows remain.');
    }

    console.log('book_categories integrity is valid.');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    await pool.end();
    process.exit(1);
  }
}

main();