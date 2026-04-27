import Link from 'next/link';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import type { OrderStatus, Prisma } from '@prisma/client';
import { ClearCartAfterSuccess } from '@/components/ClearCartAfterSuccess';
import { createServerTranslator, detectServerLocale } from '@/lib/i18n/server';

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    orderItems: { include: { book: { include: { bookAuthors: { include: { author: true } } } } } };
    shippingMethod: true;
  };
}>;

// ─── helpers ────────────────────────────────────────────────────────────────

function statusBadge(status: OrderStatus, t: (key: string, params?: Record<string, string | number>) => string): { label: string; cls: string } {
  switch (status) {
    case 'PAID':      return { label: t('success.statusPaid'),               cls: 'bg-green-100 text-green-700' };
    case 'SHIPPED':   return { label: t('success.statusShipped'),            cls: 'bg-blue-100 text-blue-700' };
    case 'DELIVERED': return { label: t('success.statusDelivered'),          cls: 'bg-emerald-100 text-emerald-700' };
    case 'CANCELLED': return { label: t('success.statusCancelled'),          cls: 'bg-red-100 text-red-700' };
    default:          return { label: t('success.statusPendingProcessing'),  cls: 'bg-amber-100 text-amber-700' };
  }
}

// ─── error states ────────────────────────────────────────────────────────────

function ErrorShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-amber-100 bg-white px-8 py-12 text-center shadow-lg">
        {children}
      </div>
    </main>
  );
}

function NotFoundUI({ t }: { t: (key: string, params?: Record<string, string | number>) => string }) {
  return (
    <ErrorShell>
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
        <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <h1 className="font-serif text-2xl font-bold text-secondary">{t('success.notFoundTitle')}</h1>
      <p className="mt-3 text-zinc-600 text-sm leading-relaxed">
        {t('success.notFoundDescription')}
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/contacts"
          className="rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary-hover"
        >
          {t('success.contactSupport')}
        </Link>
        <Link
          href="/catalog"
          className="rounded-xl border border-secondary-soft bg-white px-5 py-3 font-semibold text-secondary transition hover:bg-amber-50"
        >
          {t('success.backToCatalog')}
        </Link>
      </div>
    </ErrorShell>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const locale = detectServerLocale();
  const { t, formatDate, formatPrice } = createServerTranslator(locale);
  const { session_id } = await searchParams;

  if (!session_id) {
    return <NotFoundUI t={t} />;
  }

  // 1. Find the order in the database
  let order: OrderWithRelations | null = null;
  try {
    order = await prisma.order.findFirst({
      where: { stripePaymentId: session_id },
      include: {
        orderItems: {
          include: { book: { include: { bookAuthors: { include: { author: true } } } } },
        },
        shippingMethod: true,
      },
    });
  } catch (err) {
    console.error('DB error on /success:', err);
  }

  if (!order) {
    return <NotFoundUI t={t} />;
  }

  // 2. Fetch Stripe session for guest info + line items (not stored in DB yet)
  type StripeItem = { name: string; quantity: number; unitCents: number; totalCents: number };
  let customerEmail = '';
  let guestName = '';
  let phone = '';
  let deliveryAddress = '';
  let deliveryMethod = '';
  let stripeItems: StripeItem[] = [];

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-02-25.clover',
    });
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items'],
    });

    customerEmail  = session.customer_details?.email ?? session.customer_email ?? '';
    guestName      = session.metadata?.guestName      ?? '';
    phone          = session.metadata?.phone          ?? '';
    deliveryAddress = session.metadata?.address       ?? '';
    deliveryMethod = session.metadata?.deliveryMethod ?? '';

    stripeItems = (session.line_items?.data ?? []).map((li) => ({
      name:       li.description ?? '',
      quantity:   li.quantity   ?? 1,
      unitCents:  li.price?.unit_amount ?? 0,
      totalCents: li.amount_total,
    }));
  } catch (err) {
    console.error('Stripe session fetch failed on /success:', err);
  }

  // Prefer DB order items (more data); fall back to Stripe line items
  const hasDbItems = order.orderItems.length > 0;
  const total      = Number(order.totalPrice ?? 0);
  const badge      = statusBadge(order.status, t);

  return (
    <main className="min-h-screen bg-background px-4 py-12 md:py-16">
      <div className="mx-auto max-w-2xl space-y-5">

        {/* ── SUCCESS HEADER ─────────────────────────────────────── */}
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 shadow-md ring-4 ring-green-50">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-bold text-secondary md:text-4xl">
            {t('success.thankYou')}
          </h1>
          <p className="mt-2 text-secondary-soft">
            {t('success.placedSuccessfully', { id: order.id })}
          </p>
        </div>

        {/* ── ORDER DETAILS ──────────────────────────────────────── */}
        <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-secondary">{t('success.orderDetails')}</h2>
          <dl className="divide-y divide-amber-50 text-sm">

            <Row label={t('success.orderNumber')}>
              <span className="font-semibold text-zinc-800">#{order.id}</span>
            </Row>

            <Row label={t('success.date')}>
              <span className="text-zinc-700">{formatDate(order.createdAt)}</span>
            </Row>

            {guestName && (
              <Row label={t('success.recipient')}>
                <span className="text-zinc-700">{guestName}</span>
              </Row>
            )}

            {customerEmail && (
              <Row label={t('profile.email')}>
                <span className="text-zinc-700">{customerEmail}</span>
              </Row>
            )}

            {phone && (
              <Row label={t('profile.phone')}>
                <span className="text-zinc-700">{phone}</span>
              </Row>
            )}

            <Row label={t('success.status')}>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.cls}`}>
                {badge.label}
              </span>
            </Row>

          </dl>
        </section>

        {/* ── BOOK LIST ──────────────────────────────────────────── */}
        {(hasDbItems || stripeItems.length > 0) && (
          <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-secondary">{t('success.orderItems')}</h2>

            <ul className="space-y-3">
              {hasDbItems
                ? order.orderItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-4 border-b border-amber-50 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="font-serif text-sm font-semibold text-zinc-800 leading-snug">
                          {item.book?.title ?? '—'}
                        </p>
                        {item.book?.bookAuthors[0]?.author?.name && (
                          <p className="mt-0.5 text-xs text-zinc-500">{item.book.bookAuthors[0].author.name}</p>
                        )}
                      </div>
                      <div className="shrink-0 text-right text-sm">
                        <p className="text-zinc-500">
                          {item.quantity ?? 1} × {formatPrice(Number(item.price ?? 0))}
                        </p>
                        <p className="font-semibold text-secondary">
                          {formatPrice(Number(item.price ?? 0) * (item.quantity ?? 1))}
                        </p>
                      </div>
                    </li>
                  ))
                : stripeItems.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start justify-between gap-4 border-b border-amber-50 pb-3 last:border-0 last:pb-0"
                    >
                      <p className="min-w-0 font-serif text-sm font-semibold text-zinc-800 leading-snug">
                        {item.name || '—'}
                      </p>
                      <div className="shrink-0 text-right text-sm">
                        <p className="text-zinc-500">
                          {item.quantity} × {formatPrice(item.unitCents / 100)}
                        </p>
                        <p className="font-semibold text-secondary">
                          {formatPrice(item.totalCents / 100)}
                        </p>
                      </div>
                    </li>
                  ))}
            </ul>

            {/* Total */}
            <div className="mt-4 flex items-center justify-between border-t border-amber-100 pt-4">
              <span className="font-semibold text-zinc-700">{t('success.total')}</span>
              <span className="text-xl font-bold text-secondary">{formatPrice(total)}</span>
            </div>
          </section>
        )}

        {/* ── DELIVERY ───────────────────────────────────────────── */}
        {(order.shippingMethod?.name || deliveryMethod || deliveryAddress) && (
          <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-secondary">{t('success.delivery')}</h2>
            <dl className="divide-y divide-amber-50 text-sm">
              {(order.shippingMethod?.name || deliveryMethod) && (
                <Row label={t('success.deliveryMethod')}>
                  <span className="text-zinc-700">
                    {order.shippingMethod?.name ?? deliveryMethod}
                  </span>
                </Row>
              )}
              {deliveryAddress && (
                <Row label={t('success.address')}>
                  <span className="text-right text-zinc-700">{deliveryAddress}</span>
                </Row>
              )}
            </dl>
          </section>
        )}

        

        {/* Clears the Zustand cart in the browser after a completed order */}
        <ClearCartAfterSuccess sessionId={session_id} />

        {/* ── BUTTONS ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/catalog"
            className="flex-1 rounded-xl bg-primary px-5 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-primary-hover active:scale-[0.98]"
          >
            {t('success.backToCatalog')}
          </Link>
          <Link
            href="/contacts"
            className="flex-1 rounded-xl border border-secondary-soft bg-white px-5 py-3 text-center font-semibold text-secondary shadow-sm transition hover:bg-amber-50 active:scale-[0.98]"
          >
            {t('success.askQuestion')}
          </Link>
        </div>

      </div>
    </main>
  );
}

// ─── tiny layout helper ──────────────────────────────────────────────────────

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-zinc-500">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
