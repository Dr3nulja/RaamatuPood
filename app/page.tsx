import SearchBar from "../components/SearchBar";
import BookCard from "../components/BookCard";
import CategoryCard from "../components/CategoryCard";
import Header from "../components/Header";
import prisma from "../lib/prisma";
import Link from "next/link";

export default async function Home() {
  // fetch popular books
  const popularBooks = await prisma.book.findMany({
    select: {
      title: true,
      coverImage: true,
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      rating: "desc",
    },
    take: 8,
  });

  // fetch new arrivals
  const newArrivals = await prisma.book.findMany({
    select: {
      title: true,
      coverImage: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  });

  // fetch categories
  const categories = await prisma.category.findMany({
    select: {
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const popularBooksFormatted = popularBooks.map((b: typeof popularBooks[0]) => ({
    title: b.title,
    author: b.author?.name,
    cover: b.coverImage || undefined,
  }));

  const newArrivalsFormatted = newArrivals.map((b: typeof newArrivals[0]) => ({
    title: b.title,
    cover: b.coverImage || undefined,
  }));

  const categoryNames = categories.map((c: typeof categories[0]) => c.name);

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen font-sans text-gray-900 dark:text-gray-100">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-800 via-amber-700 to-yellow-600 dark:from-amber-900 dark:via-amber-800 dark:to-yellow-800 py-20 md:py-32">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Погрузитесь в <span className="bg-gradient-to-r from-amber-100 to-yellow-100 bg-clip-text text-transparent">мир книг</span>
            </h1>
            <p className="text-xl md:text-2xl text-amber-50 mb-8 max-w-2xl mx-auto">
              Откройте для себя лучшие произведения мировой литературы. Тысячи книг на любой вкус всего в несколько кликов
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/catalog"
                className="px-8 py-4 bg-white text-amber-800 rounded-lg font-bold hover:bg-amber-50 transition-colors shadow-lg text-center"
              >
                Перейти в каталог →
              </Link>
              <Link
                href="/#about"
                className="px-8 py-4 bg-white/20 text-white rounded-lg font-bold hover:bg-white/30 transition-colors backdrop-blur border border-white/30"
              >
                Подробнее
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 space-y-20">
        {/* search section */}
        <section className="mt-[-60px] relative z-20">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto">
            <p className="text-center text-gray-600 dark:text-gray-400 mb-4 text-sm font-medium">ПОИСК КНИГИ</p>
            <SearchBar />
          </div>
        </section>

        {/* popular books section */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-amber-800 dark:text-amber-500 text-sm font-bold uppercase tracking-widest mb-2">Хиты продаж</p>
              <h2 className="text-4xl font-bold">Популярные книги</h2>
            </div>
            <Link
              href="/catalog"
              className="text-amber-800 dark:text-amber-500 hover:underline font-semibold hidden md:block"
            >
              Смотреть все →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {popularBooksFormatted.map((b: typeof popularBooksFormatted[0], idx: number) => (
              <div key={idx} className="group">
                <BookCard title={b.title} author={b.author} cover={b.cover} />
              </div>
            ))}
          </div>
        </section>

        {/* new arrivals section */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-amber-700 dark:text-amber-500 text-sm font-bold uppercase tracking-widest mb-2">Свежие поступления</p>
              <h2 className="text-4xl font-bold">Новинки издательства</h2>
            </div>
            <Link
              href="/catalog"
              className="text-amber-700 dark:text-amber-500 hover:underline font-semibold hidden md:block"
            >
              Смотреть все →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivalsFormatted.map((b: typeof newArrivalsFormatted[0], idx: number) => (
              <div key={idx} className="group">
                <BookCard title={b.title} cover={b.cover} />
              </div>
            ))}
          </div>
        </section>

        {/* categories section */}
        <section className="py-12">
          <div className="mb-12">
            <p className="text-amber-700 dark:text-amber-500 text-sm font-bold uppercase tracking-widest mb-3">Выбирайте по интересам</p>
            <h2 className="text-4xl font-bold mb-4">Категории и жанры</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">Найдите свой любимый жанр среди нашей большой коллекции литературы</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {categoryNames.map((c: string, idx: number) => (
              <CategoryCard key={idx} name={c} />
            ))}
          </div>
        </section>

        {/* about section */}
        <section id="about" className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl p-12 my-20">
          <div className="max-w-3xl">
            <div className="mb-6">
              <p className="text-amber-800 dark:text-amber-500 text-sm font-bold uppercase tracking-widest mb-3">О нас</p>
              <h2 className="text-4xl font-bold mb-4">Ваш путеводитель в мир литературы</h2>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              RaamatuPood — это современный книжный магазин, где каждый найдет что-то для себя. От классической литературы до современных бестселлеров, от детских сказок до научных трудов. Мы верим, что чтение меняет жизнь, и помогаем вам найти идеальную книгу.
            </p>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-amber-800 dark:text-amber-500">50K+</p>
                <p className="text-gray-600 dark:text-gray-400">Книг в каталоге</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-500">100K+</p>
                <p className="text-gray-600 dark:text-gray-400">Довольных читателей</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-500">24/7</p>
                <p className="text-gray-600 dark:text-gray-400">Поддержка клиентов</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="bg-gradient-to-r from-amber-800 to-amber-900 dark:from-amber-900 dark:to-amber-950 rounded-3xl p-12 text-center text-white mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Готовы начать путешествие?</h2>
          <p className="text-amber-100 text-lg mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам читателей и найдите свою следующую любимую книгу
          </p>
          <Link
            href="/catalog"
            className="inline-block px-8 py-4 bg-white text-amber-800 rounded-lg font-bold hover:bg-amber-50 transition-colors"
          >
            Начать покупки
          </Link>
        </section>
      </main>
    </div>
  );
}