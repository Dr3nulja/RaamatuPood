import Link from 'next/link';

const collectedData = [
  'Contact details: name, email, phone number (if provided).',
  'Order data: ordered books, delivery address, payment method, order status.',
  'Account data: order history, favorites, reviews, and profile settings.',
  'Technical data: IP address, device type, browser data, cookies, and on-site actions.',
];

const usageReasons = [
  'Order placement, confirmation, and delivery.',
  'User support and handling requests.',
  'Catalog personalization and book recommendations.',
  'Fraud prevention, account protection, and site stability.',
  'Compliance with legal and accounting obligations.',
];

const userRights = [
  'Receive a copy of the data we store about you.',
  'Correct inaccurate or outdated data.',
  'Delete your account and related data if no retention obligations apply.',
  'Restrict or object to data processing in specific cases.',
  'Withdraw consent for marketing communications at any time.',
];

export default function PrivacyPage() {
  return (
    <main className="ui-page">
      <section className="relative overflow-hidden border-b border-amber-100 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-700">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-yellow-200/20 blur-3xl" />

        <div className="ui-container relative px-4 py-12 md:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100">Privacy Policy</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight !text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] md:text-5xl">
            RaamatuPood Privacy Policy
          </h1>
          <p className="mt-5 max-w-3xl text-base text-amber-50 md:text-lg">
            We treat your data with care and explain in plain language what we collect, why we collect it, and what rights you have.
          </p>
          <p className="mt-3 text-sm font-medium text-amber-100">Last updated: April 1, 2023</p>
        </div>
      </section>

      <section className="ui-container px-4 py-8 md:py-12">
        <div className="ui-card p-6 md:p-8">
          <h2 className="text-2xl font-bold text-secondary md:text-3xl">1. Introduction</h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-700">
            This policy describes how RaamatuPood collects and uses personal data when you use the site,
            your account, and order services. We follow principles of legality, transparency, data minimization,
            and security aligned with modern data protection standards, including core GDPR principles.
          </p>
          <p className="mt-3 text-base leading-relaxed text-zinc-700">
            By using the site, you confirm that you have read this policy. For some actions
            (such as marketing emails), we request separate consent, which you can withdraw at any time.
          </p>
        </div>
      </section>

      <section className="bg-surface-muted/70 py-8 md:py-12">
        <div className="ui-container grid gap-6 px-4 lg:grid-cols-2">
          <article className="ui-panel p-6 md:p-7">
            <h2 className="text-2xl font-bold text-secondary md:text-3xl">2. What data we collect</h2>
            <ul className="mt-5 space-y-3">
              {collectedData.map((item) => (
                <li key={item} className="relative pl-6 text-sm leading-relaxed text-zinc-700 md:text-base">
                  <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="ui-panel p-6 md:p-7">
            <h2 className="text-2xl font-bold text-secondary md:text-3xl">3. How we use data</h2>
            <ul className="mt-5 space-y-3">
              {usageReasons.map((item) => (
                <li key={item} className="relative pl-6 text-sm leading-relaxed text-zinc-700 md:text-base">
                  <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="ui-container px-4 py-8 md:py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="ui-card p-6 md:p-8">
            <h2 className="text-2xl font-bold text-secondary md:text-3xl">4. Data protection and retention</h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-700">
              We apply technical and organizational safeguards: access control, secure connections,
              suspicious activity monitoring, and limited employee access to personal data.
            </p>
            <p className="mt-3 text-base leading-relaxed text-zinc-700">
              Data is retained only as long as necessary for order fulfillment, account support,
              legal compliance, and dispute resolution. After that period, data is deleted or anonymized.
            </p>
          </article>

          <article className="ui-card p-6 md:p-8">
            <h2 className="text-2xl font-bold text-secondary md:text-3xl">5. Sharing with third parties</h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-700">
              We do not sell personal data. Sharing is possible only when necessary:
            </p>
            <ul className="mt-4 space-y-3">
              <li className="relative pl-6 text-sm leading-relaxed text-zinc-700 md:text-base">
                <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                Payment and logistics partners to process payments and deliveries.
              </li>
              <li className="relative pl-6 text-sm leading-relaxed text-zinc-700 md:text-base">
                <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                IT providers that maintain the site and infrastructure.
              </li>
              <li className="relative pl-6 text-sm leading-relaxed text-zinc-700 md:text-base">
                <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                Public authorities, when required by law.
              </li>
            </ul>
            <p className="mt-4 text-base leading-relaxed text-zinc-700">
              In all cases, we require our partners to maintain confidentiality and data protection standards.
            </p>
          </article>
        </div>
      </section>

      <section className="ui-container px-4 pb-12 md:pb-16">
        <div className="ui-card p-6 md:p-8">
          <h2 className="text-2xl font-bold text-secondary md:text-3xl">6. Your rights and consent management</h2>
          <ul className="mt-5 space-y-3">
            {userRights.map((item) => (
              <li key={item} className="relative pl-6 text-sm leading-relaxed text-zinc-700 md:text-base">
                <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-base leading-relaxed text-zinc-700">
            To exercise your rights, contact us through the contacts page. We respond within a reasonable timeframe
            and may request identity verification to protect your account from unauthorized actions.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-secondary md:text-3xl">7. Contacts</h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-700">
            If you have questions about privacy, data processing, or this policy, contact us:
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/contacts"
              className="inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Contacts page
            </Link>
            <a
              href="mailto:privacy@raamatupood.example"
              className="inline-flex items-center rounded-xl border border-amber-200 bg-white px-5 py-2.5 text-sm font-semibold text-secondary transition hover:bg-amber-50"
            >
              privacy@raamatupood.example
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
