import Link from 'next/link';

const whyChooseUs = [
  {
    title: 'Curated picks that save time',
    description: 'We help you quickly find a book by mood, topic, and interest, so you spend less time searching and more time reading.',
  },
  {
    title: 'Books worth recommending',
    description: 'Our catalog is built around quality: bestsellers, strong classics, and worthy new releases without random entries.',
  },
  {
    title: 'Clear and honest service',
    description: 'Transparent checkout, fast delivery, and support that gives practical answers and truly helps.',
  },
  {
    title: 'Reader-first experience',
    description: 'From discovery to checkout, the interface is designed to keep you confident at every step.',
  },
];

const values = [
  'Reading should be accessible and inspiring every day.',
  'We value attention to detail: from book descriptions to service quality.',
  'Customer trust matters more than short-term campaigns and loud promises.',
];

export default function About() {
  return (
    <main className="ui-page">
      <section className="relative overflow-hidden border-b border-amber-100 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-700">
        <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-yellow-200/20 blur-3xl" />

        <div className="ui-container relative px-4 py-14 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100">About RaamatuPood</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight !text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] md:text-6xl">
            We create a place where finding a book feels effortless
          </h1>
          <p className="mt-6 max-w-2xl text-base text-amber-50 md:text-lg">
            RaamatuPood is an online bookstore for readers who value great selection, convenient service, and an atmosphere that keeps you coming back for your next story.
          </p>
        </div>
      </section>

      <section className="ui-container px-4 py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <article className="ui-card p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Who we are</p>
            <h2 className="mt-3 text-3xl font-bold text-secondary md:text-4xl">A bookstore with a human touch</h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-700 md:text-lg">
              We started RaamatuPood with a simple idea: buying a book online should feel as pleasant as visiting your favorite bookstore.
              That is why we combine a well-curated catalog, intuitive interface, and service that helps instead of complicating.
            </p>
            <p className="mt-4 text-base leading-relaxed text-zinc-700 md:text-lg">
              For us, every book is not just a product, but a chance to meet a new idea, emotion, or inspiration.
            </p>
          </article>

          <aside className="ui-card overflow-hidden p-3 md:p-4">
            <img
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80"
              alt="Cozy space with books"
              className="h-64 w-full rounded-xl object-cover md:h-full"
            />
          </aside>
        </div>
      </section>

      <section className="bg-surface-muted/75 py-10 md:py-14">
        <div className="ui-container px-4">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Why readers choose us</p>
            <h2 className="mt-2 text-3xl font-bold text-secondary md:text-4xl">Everything that matters for comfortable reading</h2>
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
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Our mission and values</p>
          <h2 className="mt-3 text-3xl font-bold text-secondary md:text-4xl">Helping people read more with joy</h2>

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
              Browse catalog
            </Link>
            <Link
              href="/contacts"
              className="inline-flex items-center rounded-xl border border-amber-200 bg-white px-6 py-3 text-sm font-semibold text-secondary transition hover:bg-amber-50"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}