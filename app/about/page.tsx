import Link from 'next/link';

const whyChooseUs = [
  {
    title: 'Подборки, которые экономят время',
    description: 'Мы помогаем быстро найти книгу по настроению, теме и интересам, чтобы вы меньше искали и больше читали.',
  },
  {
    title: 'Книги, которые хочется рекомендовать',
    description: 'Каталог собран с фокусом на качество: бестселлеры, сильная классика и достойные новинки без случайных позиций.',
  },
  {
    title: 'Понятный и честный сервис',
    description: 'Прозрачное оформление заказа, быстрая доставка и поддержка, которая говорит по делу и действительно помогает.',
  },
  {
    title: 'Опыт, удобный для читателя',
    description: 'От поиска до оформления заказа интерфейс сделан так, чтобы вы чувствовали уверенность на каждом шаге.',
  },
];

const values = [
  'Чтение должно быть доступным и вдохновляющим каждый день.',
  'Мы ценим внимание к деталям: от описаний книг до качества сервиса.',
  'Доверие клиента важнее краткосрочных акций и громких обещаний.',
];

export default function About() {
  return (
    <main className="ui-page">
      <section className="relative overflow-hidden border-b border-amber-100 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-700">
        <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-yellow-200/20 blur-3xl" />

        <div className="ui-container relative px-4 py-14 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100">О RaamatuPood</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight !text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] md:text-6xl">
            Мы создаем место, где книгу можно найти с удовольствием
          </h1>
          <p className="mt-6 max-w-2xl text-base text-amber-50 md:text-lg">
            RaamatuPood - это книжный онлайн-магазин для тех, кто ценит хороший выбор, удобный сервис и атмосферу, в которой хочется возвращаться за новой историей.
          </p>
        </div>
      </section>

      <section className="ui-container px-4 py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <article className="ui-card p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Кто мы</p>
            <h2 className="mt-3 text-3xl font-bold text-secondary md:text-4xl">Книжный магазин с человеческим подходом</h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-700 md:text-lg">
              Мы начали RaamatuPood с простой идеи: покупка книги в интернете должна быть такой же приятной, как прогулка по любимому книжному.
              Поэтому мы сочетаем продуманный каталог, понятный интерфейс и сервис, который помогает, а не усложняет.
            </p>
            <p className="mt-4 text-base leading-relaxed text-zinc-700 md:text-lg">
              Для нас каждая книга - это не просто товар, а потенциально важная встреча с новой мыслью, эмоцией или вдохновением.
            </p>
          </article>

          <aside className="ui-card overflow-hidden p-3 md:p-4">
            <img
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80"
              alt="Уютное пространство с книгами"
              className="h-64 w-full rounded-xl object-cover md:h-full"
            />
          </aside>
        </div>
      </section>

      <section className="bg-surface-muted/75 py-10 md:py-14">
        <div className="ui-container px-4">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Почему выбирают нас</p>
            <h2 className="mt-2 text-3xl font-bold text-secondary md:text-4xl">Все, что важно для комфортного чтения</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {whyChooseUs.map((item) => (
              <article key={item.title} className="ui-panel p-5 md:p-6">
                <h3 className="text-lg font-semibold text-zinc-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-700 md:text-base">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ui-container px-4 py-10 md:py-14">
        <div className="ui-card p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Наша миссия и ценности</p>
          <h2 className="mt-3 text-3xl font-bold text-secondary md:text-4xl">Помогать людям читать больше и с радостью</h2>

          <ul className="mt-6 space-y-4">
            {values.map((value) => (
              <li
                key={value}
                className="relative rounded-xl border border-amber-100 bg-amber-50/45 px-4 py-3 pl-11 text-base leading-relaxed text-zinc-800"
              >
                <span className="absolute left-4 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-primary" />
                {value}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/catalog"
              className="inline-flex items-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Перейти в каталог
            </Link>
            <Link
              href="/contacts"
              className="inline-flex items-center rounded-xl border border-amber-200 bg-white px-6 py-3 text-sm font-semibold text-secondary transition hover:bg-amber-50"
            >
              Связаться с нами
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}