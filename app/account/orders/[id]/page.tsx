import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireUserFlowAccess } from '@/lib/auth/flow';
import { createServerTranslator, detectServerLocale } from '@/lib/i18n/server';

export const dynamic = 'force-dynamic';

const statusStyles: Record<'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled', string> = {
  pending: 'bg-amber-100 text-amber-900',
  paid: 'bg-sky-100 text-sky-900',
  shipped: 'bg-indigo-100 text-indigo-900',
  delivered: 'bg-emerald-100 text-emerald-900',
  cancelled: 'bg-red-100 text-red-900',
};

const statusKeyMap: Record<'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled', string> = {
  pending: 'profile.orders.pending',
  paid: 'profile.orders.paid',
  shipped: 'profile.orders.shipped',
  delivered: 'profile.orders.delivered',
  cancelled: 'profile.orders.cancelled',
};

export default async function AccountOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user: currentUser } = await requireUserFlowAccess({ returnTo: '/account' });
  const locale = detectServerLocale();
  const { t, formatDate, formatPrice } = createServerTranslator(locale);

  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: currentUser.id,
    },
    include: {
      address: true,
      shippingMethod: true,
      orderItems: {
        include: {
          book: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const normalizedStatus = order.status.toLowerCase() as keyof typeof statusStyles;
  const formattedOrderDate = formatDate(order.createdAt);
  const formattedTotal = formatPrice(Number(order.totalPrice ?? 0));

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#faf7f2_0%,#ffffff_100%)] px-4 py-8 md:px-6 md:py-10">
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-amber-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">{t('profile.orders.detailsTitle')}</p>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-zinc-900">{t('profile.orders.orderId', { id: order.id })}</h1>
            <p className="text-sm text-zinc-500">{formattedOrderDate}</p>
          </div>

          <span className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[normalizedStatus]}`}>
            {t(statusKeyMap[normalizedStatus])}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-zinc-50 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">{t('profile.orders.delivery')}</h2>
            <p className="mt-3 text-sm text-zinc-700">{t('profile.orders.deliveryMethod')}: {order.shippingMethod?.name || '—'}</p>
            <p className="mt-2 text-sm text-zinc-700">
              {t('profile.form.address')}: {order.address
                ? `${order.address.street || ''}, ${order.address.postalCode || ''} ${order.address.city || ''}, ${order.address.country || ''}`
                : t('profile.orders.noAddress')}
            </p>
          </div>

          <div className="rounded-3xl bg-amber-50 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">{t('profile.orders.total')}</h2>
            <p className="mt-3 text-3xl font-bold text-amber-700">{formattedTotal}</p>
            <p className="mt-2 text-sm text-zinc-600">{t('profile.orders.allCharges')}</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">{t('profile.orders.books')}</h2>
          <div className="mt-4 space-y-3">
            {order.orderItems.map((item) => (
              <div key={item.id} className="rounded-3xl border border-amber-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-zinc-900">
                      {item.book?.title || 'Book'} × {item.quantity ?? 1}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">{t('profile.orders.itemPrice')}: {formatPrice(Number(item.price ?? 0))}</p>
                  </div>

                  {order.status === 'DELIVERED' && item.bookId ? (
                    <Link
                      href={`/catalog/${item.bookId}`}
                      className="inline-flex w-fit rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-secondary transition hover:bg-amber-100"
                    >
                      {t('profile.orders.leaveReview')}
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-amber-100 pt-5">
          <Link
            href="/account"
            className="rounded-full border border-amber-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-amber-50"
          >
            {t('profile.orders.backToAccount')}
          </Link>
        </div>
      </section>
    </main>
  );
}
