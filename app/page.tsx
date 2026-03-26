import Link from 'next/link';
import prisma from '@/lib/prisma';
import HomeBookSearch from '@/components/HomeBookSearch';

export default async function Home() {
  const popularBooks = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      rating: true,
      coverImage: true,
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      rating: 'desc',
    },
    take: 12,
  });

  const recommendedBooks = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      rating: true,
      coverImage: true,
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 8,
  });

  const normalizeCover = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return `/images/${url}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F0] via-white to-[#F9F4EC] text-zinc-900">
      <section className="relative overflow-hidden border-b border-amber-100 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-700">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-yellow-200/20 blur-3xl" />

        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-100">Онлайн-магазин книг</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-white md:text-6xl">
              Найди свою следующую любимую книгу
            </h1>
            <p className="mt-5 max-w-xl text-base text-amber-50 md:text-lg">
              Открывайте бестселлеры, классику и новинки в одном месте. Выбирайте книгу по интересам и начинайте читать уже сегодня.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
              >
                Посмотреть каталог
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-100/30 bg-white/10 p-4 shadow-2xl backdrop-blur md:p-6">
            <img
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80"
              alt="Books banner"
              className="h-72 w-full rounded-2xl object-cover md:h-96"
            />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-16 px-4 py-10 md:py-14">
        <section className="relative z-20 -mt-20 rounded-3xl border border-amber-100 bg-white p-5 shadow-xl md:p-7">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Поиск книги</p>
          <HomeBookSearch />
        </section>

        <section>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Топ подборка</p>
              <h2 className="mt-2 text-3xl font-bold text-zinc-900 md:text-4xl">Популярные книги</h2>
            </div>
            <Link href="/catalog" className="text-sm font-semibold text-amber-800 hover:text-amber-600">
              Смотреть всё →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popularBooks.map((book) => (
              <article
                key={book.id}
                className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl"
              >
                <div className="aspect-[3/4] overflow-hidden bg-amber-50">
                  {normalizeCover(book.coverImage) ? (
                    <img
                      src={normalizeCover(book.coverImage) || ''}
                      alt={book.title}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-amber-700">No cover</div>
                  )}
                </div>

                <div className="space-y-2 p-4">
                  <h3 className="line-clamp-2 text-base font-semibold text-zinc-900">{book.title}</h3>
                  <p className="text-sm text-zinc-600">{book.author?.name || 'Автор не указан'}</p>
                  <p className="text-sm font-semibold text-amber-700">★ {Number(book.rating ?? 0).toFixed(1)}</p>
                  <Link
                    href={`/catalog/${book.id}`}
                    className="inline-flex rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
                  >
                    Подробнее
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Новые рекомендации</p>
              <h2 className="mt-2 text-3xl font-bold text-zinc-900 md:text-4xl">Рекомендуем к прочтению</h2>
            </div>
            <Link href="/catalog" className="text-sm font-semibold text-amber-800 hover:text-amber-600">
              В каталог →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recommendedBooks.map((book) => (
              <article
                key={book.id}
                className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl"
              >
                <div className="aspect-[3/4] overflow-hidden bg-amber-50">
                  {normalizeCover(book.coverImage) ? (
                    <img
                      src={normalizeCover(book.coverImage) || ''}
                      alt={book.title}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-amber-700">No cover</div>
                  )}
                </div>

                <div className="space-y-2 p-4">
                  <h3 className="line-clamp-2 text-base font-semibold text-zinc-900">{book.title}</h3>
                  <p className="text-sm text-zinc-600">{book.author?.name || 'Автор не указан'}</p>
                  <p className="text-sm font-semibold text-amber-700">★ {Number(book.rating ?? 0).toFixed(1)}</p>
                  <Link
                    href={`/catalog/${book.id}`}
                    className="inline-flex rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
                  >
                    Подробнее
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}