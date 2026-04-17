import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireUserFlowAccess } from '@/lib/auth/flow';

export const dynamic = 'force-dynamic';

const statusStyles: Record<'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled', string> = {
  pending: 'bg-amber-100 text-amber-900',
  paid: 'bg-sky-100 text-sky-900',
  shipped: 'bg-indigo-100 text-indigo-900',
  delivered: 'bg-emerald-100 text-emerald-900',
  cancelled: 'bg-red-100 text-red-900',
};

export default async function AccountOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user: currentUser } = await requireUserFlowAccess({ returnTo: '/account' });

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

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#faf7f2_0%,#ffffff_100%)] px-4 py-8 md:px-6 md:py-10">
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-amber-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Order details</p>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-zinc-900">Заказ #{order.id}</h1>
            <p className="text-sm text-zinc-500">
              {new Intl.DateTimeFormat('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }).format(order.createdAt)}
            </p>
          </div>

          <span className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[order.status.toLowerCase() as keyof typeof statusStyles]}`}>
            {order.status.toLowerCase()}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-zinc-50 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Delivery</h2>
            <p className="mt-3 text-sm text-zinc-700">Method: {order.shippingMethod?.name || '—'}</p>
            <p className="mt-2 text-sm text-zinc-700">
              Address: {order.address
                ? `${order.address.street || ''}, ${order.address.postalCode || ''} ${order.address.city || ''}, ${order.address.country || ''}`
                : '—'}
            </p>
          </div>

          <div className="rounded-3xl bg-amber-50 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Total</h2>
            <p className="mt-3 text-3xl font-bold text-amber-700">€{Number(order.totalPrice ?? 0).toFixed(2)}</p>
            <p className="mt-2 text-sm text-zinc-600">All charges for this order.</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Books</h2>
          <div className="mt-4 space-y-3">
            {order.orderItems.map((item) => (
              <div key={item.id} className="rounded-3xl border border-amber-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-zinc-900">
                      {item.book?.title || 'Книга'} × {item.quantity ?? 1}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">Line price: €{Number(item.price ?? 0).toFixed(2)}</p>
                  </div>

                  {order.status === 'DELIVERED' && item.bookId ? (
                    <Link
                      href={`/catalog/${item.bookId}`}
                      className="inline-flex w-fit rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-secondary transition hover:bg-amber-100"
                    >
                      Оставить отзыв
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
            Back to account
          </Link>
        </div>
      </section>
    </main>
  );
}
