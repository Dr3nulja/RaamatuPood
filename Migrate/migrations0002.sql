-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 02, 2026 at 11:31 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `book_store`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `country`, `city`, `street`, `postal_code`) VALUES
(1, 3, 'EE', 'Jõhvi', 'KAare 19', '41536'),
(2, 3, 'EE', 'Jõhvi', 'KAare 19', '41536'),
(3, 3, 'EE', 'Jõhvi', 'KAare 19', '41536'),
(4, 3, 'EE', 'Jõhvi', 'KAare 19', '41536'),
(5, 2, 'EE', 'Jõhvi', 'KAare 19', '41536'),
(6, 5, 'EE', 'Jõhvi', 'KAare 19', '41536'),
(7, 5, 'EE', 'Jõhvi', 'KAare 19', '41536');

-- --------------------------------------------------------

--
-- Table structure for table `authors`
--

CREATE TABLE `authors` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `authors`
--

INSERT INTO `authors` (`id`, `name`) VALUES
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

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `language` varchar(50) DEFAULT NULL,
  `publication_year` int(11) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `rating` decimal(2,1) DEFAULT 0.0,
  `cover_image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `title`, `category_id`, `description`, `price`, `language`, `publication_year`, `stock`, `rating`, `cover_image`, `created_at`) VALUES
(1, '1984', 2, 'Dystopian novel about totalitarian regime.', 12.99, 'English', 1949, 19, 4.8, 'https://covers.openlibrary.org/b/id/7222246-L.jpg', '2026-03-17 10:33:33'),
(3, 'Harry Potter and the Sorcerer\'s Stone', 1, 'First book of the Harry Potter series.', 14.99, 'English', 1997, 30, 4.9, 'https://covers.openlibrary.org/b/id/7984916-L.jpg', '2026-03-17 10:33:33'),
(4, 'Harry Potter and the Chamber of Secrets', 1, 'Second Harry Potter adventure.', 14.99, 'English', 1998, 25, 4.8, 'https://covers.openlibrary.org/b/id/8231996-L.jpg', '2026-03-17 10:33:33'),
(5, 'The Hobbit', 7, 'Adventure of Bilbo Baggins.', 13.99, 'English', 1937, 20, 4.9, 'https://covers.openlibrary.org/b/id/6979861-L.jpg', '2026-03-17 10:33:33'),
(6, 'The Lord of the Rings', 7, 'Epic fantasy adventure.', 24.99, 'English', 1954, 14, 5.0, 'https://covers.openlibrary.org/b/id/8231856-L.jpg', '2026-03-17 10:33:33'),
(7, 'The Great Gatsby', 3, 'Story about the American dream.', 11.99, 'English', 1925, 18, 4.4, 'https://covers.openlibrary.org/b/id/7222161-L.jpg', '2026-03-17 10:33:33'),
(8, 'To Kill a Mockingbird', 6, 'Novel about racial injustice.', 12.99, 'English', 1960, 16, 2.0, 'https://covers.openlibrary.org/b/id/8225261-L.jpg', '2026-03-17 10:33:33'),
(9, 'The Da Vinci Code', 5, 'Mystery thriller involving secret societies.', 15.99, 'English', 2003, 22, 4.5, 'https://covers.openlibrary.org/b/id/240726-L.jpg', '2026-03-17 10:33:33'),
(10, 'Angels and Demons', 5, 'Thriller about secret societies.', 15.99, 'English', 2000, 17, 4.6, 'https://covers.openlibrary.org/b/id/240727-L.jpg', '2026-03-17 10:33:33'),
(11, 'The Shining', 5, 'Psychological horror novel.', 14.50, 'English', 1977, 16, 4.7, 'https://covers.openlibrary.org/b/id/8231991-L.jpg', '2026-03-17 10:33:33'),
(12, 'Murder on the Orient Express', 4, 'Famous detective story.', 13.50, 'English', 1934, 14, 4.8, 'https://covers.openlibrary.org/b/id/8235116-L.jpg', '2026-03-17 10:33:33'),
(13, 'The Alchemist', 6, 'Philosophical story about destiny.', 11.99, 'English', 1988, 19, 4.7, 'https://covers.openlibrary.org/b/id/8108691-L.jpg', '2026-03-17 10:33:33'),
(14, 'The Old Man and the Sea', 3, 'Story about perseverance.', 10.99, 'English', 1952, 12, 4.5, 'https://covers.openlibrary.org/b/id/8231852-L.jpg', '2026-03-17 10:33:33'),
(15, 'For Whom the Bell Tolls', 7, 'War novel set during Spanish Civil War.', 13.99, 'English', 1940, 10, 4.4, 'https://covers.openlibrary.org/b/id/8232003-L.jpg', '2026-03-17 10:33:33'),
(16, 'test', 1, 'test', 12.00, NULL, NULL, 0, 0.0, 'https://i.pinimg.com/736x/73/64/d1/7364d1cb6e54d41d7d75d9cfb9c99b0a.jpg', '2026-03-19 06:35:24');

-- --------------------------------------------------------

--
-- Table structure for table `book_authors`
--

CREATE TABLE `book_authors` (
  `book_id` int(11) NOT NULL,
  `author_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `book_authors`
--

INSERT INTO `book_authors` (`book_id`, `author_id`) VALUES
(1, 1),
(3, 2),
(4, 2),
(5, 3),
(6, 3),
(7, 4),
(8, 5),
(9, 6),
(10, 6),
(11, 7),
(12, 8),
(13, 9),
(14, 10),
(15, 10),
(16, 1);

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`id`, `user_id`, `book_id`, `quantity`) VALUES
(12, 2, 16, 1),
(18, 4, 13, 1),
(29, 6, 14, 12);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(1, 'Fantasy'),
(2, 'Science Fiction'),
(3, 'Classic'),
(4, 'Mystery'),
(5, 'Thriller'),
(6, 'Drama'),
(7, 'Adventure');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `address_id` int(11) DEFAULT NULL,
  `shipping_method_id` int(11) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','paid','shipped','delivered','cancelled') DEFAULT 'pending',
  `stripe_payment_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `address_id`, `shipping_method_id`, `total_price`, `status`, `stripe_payment_id`, `created_at`) VALUES
(1, NULL, NULL, NULL, 85.94, 'pending', 'cs_test_b1Gq5KgU2BRxOnTYfufJ5iAnijrya59MveDfacsU66C8KI863G4tIA694u', '2026-03-18 05:11:09'),
(2, 3, 1, NULL, 12.99, 'pending', 'cs_test_a1VsknzS8tPjcm2tiu2PMQReqhS89TruV1ImWwRdVDUrJFzFEgz46R1tbw', '2026-03-18 05:25:44'),
(3, 3, 3, 1, 90.93, 'pending', 'cs_test_a1cwgbdflXmSGTPbJmkkUVDq0zzzHJa1x65OehwLSr29jBd1b9m9M0loRH', '2026-03-18 06:09:59'),
(4, 3, 4, 1, 19.98, 'pending', 'cs_test_b1s7whAwn1W8ds5mPXjL9mOAgH5kiT8vM03RTlUrF8X7e1KdLIglmXDwBc', '2026-03-18 06:32:51'),
(5, 2, 5, 1, 16.98, 'cancelled', 'cs_test_b1Drh7PDrv45NPxCQwYRLoPTDOKuUYfjC8DxDcmSc7au8wMtwobI7hHpS9', '2026-03-18 10:46:38'),
(6, 5, 6, 1, 41.97, 'pending', 'cs_test_b1aNryycwQOv96AzAOreFfWeJ1vIFMZeMaaj9BC7QDF9FtMLHOL3ASwVg7', '2026-03-26 05:23:42'),
(7, 5, 7, 1, 42.96, 'delivered', 'cs_test_b1I0zSrYRTSVuzdCdbPce6iSfivSFXrrh7sks1vgYyMrvd2wl96xfC1KLG', '2026-03-26 05:26:00');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `book_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `quantity`, `price`) VALUES
(1, 4, 10, 1, 15.99),
(2, 5, 8, 1, 12.99),
(3, 6, 6, 1, 24.99),
(4, 6, 1, 1, 12.99),
(5, 7, 8, 3, 12.99);

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `book_id`, `user_id`, `rating`, `comment`, `created_at`) VALUES
(1, 8, 5, 2, '??????????????', '2026-03-26 05:48:44');

-- --------------------------------------------------------

--
-- Table structure for table `shipping_methods`
--

CREATE TABLE `shipping_methods` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `shipping_methods`
--

INSERT INTO `shipping_methods` (`id`, `name`, `price`) VALUES
(1, 'Omniva pakiautomaat', 3.99),
(2, 'Itella Smartpost', 4.49),
(3, 'Tallinn Courier', 6.00),
(4, 'Self-call', 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `auth0_id` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `picture` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `auth0_id`, `email`, `name`, `role`, `picture`, `created_at`) VALUES
(1, 'auth0|69b91a4aab6c1c515d26783e', 'yerij63955@pazard.com', 'yerij63955@pazard.com', 'user', 'https://s.gravatar.com/avatar/4a275de051def4634eacc0a0ba6b3e09?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fye.png', '2026-03-17 08:29:46'),
(2, 'auth0|69b9317ce0a0e72e98b0750a', 'fagax46512@paylaar.com', 'fagax46512@paylaar.com', 'user', 'https://s.gravatar.com/avatar/d0808be8728c2fb2bee0b46f4d075203?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Ffa.png', '2026-03-17 08:48:30'),
(3, 'auth0|69b93dc314d7b6a9441d6d80', 'gihes11874@paylaar.com', 'gihes11874@paylaar.com', 'admin', 'https://s.gravatar.com/avatar/3d3aa6556627f4682e7af973d902391e?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fgi.png', '2026-03-17 09:40:53'),
(4, 'auth0|69b917e314d7b6a9441d5806', 'jeyekis100@paylaar.com', 'jeyekis100@paylaar.com', 'user', 'https://s.gravatar.com/avatar/1fbb02eff874cb1df2b0bd3d4f149b5d?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fje.png', '2026-03-19 06:32:56'),
(5, 'auth0|69c4d4cbcb27ca80411915bc', 'jakaga2572@izkat.com', 'jakaga2572@izkat.com', 'user', 'https://s.gravatar.com/avatar/905c5b9bc85c39067fabe1f22e092181?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fja.png', '2026-03-26 04:40:41'),
(6, 'auth0|69cb5e8445b770470454f81a', 'xixopo2587@flownue.com', 'xixopo2587@flownue.com', 'user', 'https://s.gravatar.com/avatar/dcf0dc4954d278be33a6dc592bbcfb75?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fxi.png', '2026-03-31 02:41:21'),
(7, 'auth0|69cb792345b77047045504d6', 'jatovo9702@fengnu.com', 'jatovo9702@fengnu.com', 'user', 'https://s.gravatar.com/avatar/088bfcfae094d1c04440d2b9cc2b0cc5?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fja.png', '2026-03-31 04:35:37');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `authors`
--
ALTER TABLE `authors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `book_authors`
--
ALTER TABLE `book_authors`
  ADD PRIMARY KEY (`book_id`,`author_id`),
  ADD KEY `fk_book_authors_author` (`author_id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `book_id` (`book_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `address_id` (`address_id`),
  ADD KEY `shipping_method_id` (`shipping_method_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `book_id` (`book_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `book_id` (`book_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `shipping_methods`
--
ALTER TABLE `shipping_methods`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth0_id` (`auth0_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `authors`
--
ALTER TABLE `authors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `shipping_methods`
--
ALTER TABLE `shipping_methods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `books_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Constraints for table `book_authors`
--
ALTER TABLE `book_authors`
  ADD CONSTRAINT `fk_book_authors_author` FOREIGN KEY (`author_id`) REFERENCES `authors` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_book_authors_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`),
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`shipping_method_id`) REFERENCES `shipping_methods` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`);

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
