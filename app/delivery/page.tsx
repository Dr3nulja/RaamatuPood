import Link from "next/link";

const methods = [
  {
    title: "Omniva",
    description: "Parcel lockers and pickup points across Estonia. Convenient pickup any time.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" />
        <path d="M3 7.5 12 12l9-4.5" />
      </svg>
    ),
  },
  {
    title: "Itella",
    description: "Delivery to pickup points and lockers. Great balance of price and speed.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 12h16" />
        <path d="M4 12 8 8" />
        <path d="M4 12 8 16" />
        <circle cx="17" cy="16" r="2" />
      </svg>
    ),
  },
  {
    title: "Courier",
    description: "Door-to-door delivery on a convenient day and time window.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2.5" y="7" width="12" height="8" rx="1.5" />
        <path d="M14.5 9h4l3 3v3h-2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    title: "Store pickup",
    description: "Pick up your order from our location without courier wait times or extra fees.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" />
        <path d="M9.5 20v-5h5v5" />
      </svg>
    ),
  },
];

const regions = [
  { region: "Estonia", price: "from 2.90 €", time: "1-3 business days", details: "Omniva / Itella / courier" },
  { region: "Latvia", price: "from 5.90 €", time: "2-5 business days", details: "Lockers and courier" },
  { region: "Lithuania", price: "from 5.90 €", time: "2-5 business days", details: "Lockers and courier" },
  { region: "Finland", price: "from 8.90 €", time: "3-7 business days", details: "Courier services" },
  { region: "Other EU countries", price: "from 12.90 €", time: "5-12 business days", details: "International delivery" },
];

const faq = [
  {
    q: "When is the order shipped?",
    a: "We usually ship within 24 hours after payment confirmation.",
  },
  {
    q: "Can I track my package?",
    a: "Yes. After shipment, you can track order status through your account.",
  },
  {
    q: "What if delivery is delayed?",
    a: "Contact us through the contacts page and we will check status and help resolve it.",
  },
];

export default function DeliveryPage() {
  return (
    <main className="min-h-screen bg-background text-zinc-900 font-sans">
      <section className="relative overflow-hidden border-b border-amber-100 bg-gradient-to-br from-background via-background-muted to-background">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-20 lg:px-6">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-secondary">
              RaamatuPood delivery
            </p>
            <h1 className="font-serif text-3xl font-bold leading-tight text-secondary md:text-5xl">
              Fast and careful book delivery
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-700 md:text-lg">
              We deliver across Estonia and internationally with transparent timelines and pricing. Choose the method
              that suits you and receive your favorite books without hassle.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="rounded-xl bg-amber-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-900 hover:shadow-md"
              >
                Browse catalog
              </Link>
              <Link
                href="/contacts"
                className="rounded-xl border border-secondary bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary-hover"
              >
                Ask a question
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-100 bg-white p-4 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1400&q=80"
              alt="Books and delivery packaging"
              className="h-64 w-full rounded-2xl object-cover md:h-80"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
        <h2 className="font-serif text-2xl font-bold text-secondary md:text-3xl">Delivery methods</h2>
        <p className="mt-2 text-zinc-700">Choose the option that best fits your speed and pickup preferences.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {methods.map((item) => (
            <article
              key={item.title}
              className="group rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-xl bg-amber-100 p-2 text-primary transition group-hover:bg-amber-200">
                {item.icon}
              </div>
              <h3 className="font-serif text-xl font-semibold text-secondary">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 lg:px-6">
        <h2 className="font-serif text-2xl font-bold text-secondary md:text-3xl">Pricing, delivery times, and regions</h2>
        <div className="mt-6 overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm">
          <div className="hidden grid-cols-4 bg-background-muted px-5 py-3 text-sm font-semibold text-secondary md:grid">
            <div>Region</div>
            <div>Price</div>
            <div>Timing</div>
            <div>Format</div>
          </div>
          <div className="divide-y divide-amber-100">
            {regions.map((row) => (
              <div key={row.region} className="grid gap-1 px-5 py-4 md:grid-cols-4 md:gap-4">
                <p className="font-semibold text-zinc-900">{row.region}</p>
                <p className="text-zinc-700">{row.price}</p>
                <p className="text-zinc-700">{row.time}</p>
                <p className="text-zinc-700">{row.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 lg:px-6">
        <h2 className="font-serif text-2xl font-bold text-secondary md:text-3xl">Good to know</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {faq.map((item) => (
            <article key={item.q} className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition hover:shadow-md">
              <h3 className="font-serif text-lg font-semibold text-secondary">{item.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700">{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 lg:px-6">
        <div className="rounded-3xl border border-amber-900/60 bg-secondary-soft p-7 text-white shadow-lg md:p-10">
          <h2 className="font-serif text-2xl font-bold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)] md:text-3xl">
            Ready to place your order?
          </h2>
          <p className="mt-2 max-w-2xl text-white/95">
            Go to the catalog and choose your books. We will prepare and ship your order quickly in the most convenient way.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-amber-950 transition hover:bg-amber-100"
            >
              Browse catalog
            </Link>
            <Link
              href="/contacts"
              className="rounded-xl border border-white bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Ask a question
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
