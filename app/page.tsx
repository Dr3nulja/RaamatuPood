import SearchBar from "../components/SearchBar";
import BookCard from "../components/BookCard";
import CategoryCard from "../components/CategoryCard";
import Header from "../components/Header";
import pool from "../lib/db";

export default async function Home() {
  // fetch data from database
  const [popRows] = await pool.query(
    `SELECT b.title, a.name AS author, b.cover_image
     FROM books b
     LEFT JOIN authors a ON b.author_id = a.id
     ORDER BY b.rating DESC
     LIMIT 8`
  ) as [
    { title: string; author: string | null; cover_image: string | null }[],
    any
  ];
  const popularBooks = popRows.map((r) => ({
    title: r.title,
    author: r.author || undefined,
    cover: r.cover_image || undefined,
  }));

  const [newRows] = await pool.query(
    `SELECT title, cover_image
     FROM books
     ORDER BY created_at DESC
     LIMIT 8`
  ) as [
    { title: string; cover_image: string | null }[],
    any
  ];
  const newArrivals = newRows.map((r) => ({
    title: r.title,
    cover: r.cover_image || undefined,
  }));

  const [catRows] = await pool.query(
    `SELECT name FROM categories ORDER BY name`
  ) as [{ name: string }[], any];
  const categories = catRows.map((c) => c.name);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-16">
        {/* search */}
        <section className="flex justify-center">
          <SearchBar />
        </section>

        {/* popular books */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Популярные книги</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {popularBooks.map((b, idx) => (
              <BookCard key={idx} title={b.title} author={b.author} cover={b.cover} />
            ))}
          </div>
        </section>

        {/* new arrivals */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Новинки</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {newArrivals.map((b, idx) => (
              <BookCard key={idx} title={b.title} cover={b.cover} />
            ))}
          </div>
        </section>

        {/* categories */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Категории / жанры</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((c, idx) => (
              <CategoryCard key={idx} name={c} />
            ))}
          </div>
        </section>

        {/* about */}
        <section className="prose dark:prose-invert max-w-none">
          <h2>О магазине</h2>
          <p>
            Добро пожаловать в наш книжный интернет-магазин! Здесь вы можете
            быстро найти книги по интересующим вас жанрам, ознакомиться с
            новинками и выбрать популярные издания. Мы стараемся сделать
            процесс покупки удобным и приятным.
          </p>
        </section>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t">
        <div className="container mx-auto px-4 py-6 flex justify-center gap-8">
          <a
            href="#"
            className="text-sm text-gray-600 hover:underline"
          >
            Доставка
          </a>
          <a
            href="#"
            className="text-sm text-gray-600 hover:underline"
          >
            Поддержка
          </a>
        </div>
      </footer>
    </div>
  );
}