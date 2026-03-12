# Database Configuration

Configure your MySQL database connection by creating a `.env.local` file in the project root:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=book_store
```

## Setup Steps

1. Create the database tables by running:
   ```bash
   npm run db:init
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

The home page will now fetch real data from the MySQL database:
- **Popular Books**: Top-rated books sorted by rating
- **New Arrivals**: Recently added books  
- **Categories**: All available book categories

## Database Schema

The `book_store` database includes the following main tables:
- `books` - Book details with ratings, prices, stock
- `authors` - Author information
- `categories` - Book categories/genres
- `users` - User accounts (for future authentication)
- `orders` - Customer orders
- `reviews` - Book reviews and ratings
- And supporting tables for addresses, cart items, shipping methods, etc.
