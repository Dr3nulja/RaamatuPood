-- AUTHORS
INSERT INTO authors (id, name) VALUES
(1, 'George Orwell'),
(2, 'J.K. Rowling'),
(3, 'J.R.R. Tolkien'),
(4, 'F. Scott Fitzgerald'),
(5, 'Harper Lee'),
(6, 'Dan Brown'),
(7, 'Stephen King'),
(8, 'Agatha Christie'),
(9, 'Paulo Coelho'),
(10, 'Ernest Hemingway');

-- CATEGORIES
INSERT INTO categories (id, name) VALUES
(1, 'Fantasy'),
(2, 'Science Fiction'),
(3, 'Classic'),
(4, 'Mystery'),
(5, 'Thriller'),
(6, 'Drama'),
(7, 'Adventure');

-- BOOKS
INSERT INTO books 
(title, author_id, category_id, description, price, language, publication_year, stock, rating, cover_image) 
VALUES

('1984', 1, 2, 'Dystopian novel about totalitarian regime.', 12.99, 'English', 1949, 20, 4.8, 'https://covers.openlibrary.org/b/id/7222246-L.jpg'),

('Animal Farm', 1, 3, 'Political satire about farm animals.', 10.99, 'English', 1945, 15, 4.6, 'https://covers.openlibrary.org/b/id/8773270-L.jpg'),

('Harry Potter and the Sorcerer''s Stone', 2, 1, 'First book of the Harry Potter series.', 14.99, 'English', 1997, 30, 4.9, 'https://covers.openlibrary.org/b/id/7984916-L.jpg'),

('Harry Potter and the Chamber of Secrets', 2, 1, 'Second Harry Potter adventure.', 14.99, 'English', 1998, 25, 4.8, 'https://covers.openlibrary.org/b/id/8231996-L.jpg'),

('The Hobbit', 3, 7, 'Adventure of Bilbo Baggins.', 13.99, 'English', 1937, 20, 4.9, 'https://covers.openlibrary.org/b/id/6979861-L.jpg'),

('The Lord of the Rings', 3, 7, 'Epic fantasy adventure.', 24.99, 'English', 1954, 15, 5.0, 'https://covers.openlibrary.org/b/id/8231856-L.jpg'),

('The Great Gatsby', 4, 3, 'Story about the American dream.', 11.99, 'English', 1925, 18, 4.4, 'https://covers.openlibrary.org/b/id/7222161-L.jpg'),

('To Kill a Mockingbird', 5, 6, 'Novel about racial injustice.', 12.99, 'English', 1960, 20, 4.9, 'https://covers.openlibrary.org/b/id/8225261-L.jpg'),

('The Da Vinci Code', 6, 5, 'Mystery thriller involving secret societies.', 15.99, 'English', 2003, 22, 4.5, 'https://covers.openlibrary.org/b/id/240726-L.jpg'),

('Angels and Demons', 6, 5, 'Thriller about secret societies.', 15.99, 'English', 2000, 17, 4.6, 'https://covers.openlibrary.org/b/id/240727-L.jpg'),

('The Shining', 7, 5, 'Psychological horror novel.', 14.50, 'English', 1977, 16, 4.7, 'https://covers.openlibrary.org/b/id/8231991-L.jpg'),

('Murder on the Orient Express', 8, 4, 'Famous detective story.', 13.50, 'English', 1934, 14, 4.8, 'https://covers.openlibrary.org/b/id/8235116-L.jpg'),

('The Alchemist', 9, 6, 'Philosophical story about destiny.', 11.99, 'English', 1988, 19, 4.7, 'https://covers.openlibrary.org/b/id/8108691-L.jpg'),

('The Old Man and the Sea', 10, 3, 'Story about perseverance.', 10.99, 'English', 1952, 12, 4.5, 'https://covers.openlibrary.org/b/id/8231852-L.jpg'),

('For Whom the Bell Tolls', 10, 7, 'War novel set during Spanish Civil War.', 13.99, 'English', 1940, 10, 4.4, 'https://covers.openlibrary.org/b/id/8232003-L.jpg');