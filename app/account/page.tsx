import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect('/auth/login?returnTo=/account');
  }

  const user = await prisma.user.findUnique({
    where: { auth0Id: session.user.sub || '' },
    select: {
      id: true,
      orders: {
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
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  const orders = user?.orders || [];

  return (
    <main className="min-h-screen bg-[#FDF8F0] px-4 py-10">
      <section className="mx-auto max-w-2xl rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
        <h1 className="font-serif text-3xl font-bold text-[#8B5E3C]">Личный кабинет</h1>
        <p className="mt-2 text-zinc-600">Вы успешно авторизованы через Auth0.</p>

        <dl className="mt-6 divide-y divide-amber-100 text-sm">
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-zinc-500">Email</dt>
            <dd className="font-medium text-zinc-800 break-all">{session.user.email ?? '—'}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-zinc-500">Имя</dt>
            <dd className="font-medium text-zinc-800">{session.user.name ?? '—'}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-zinc-500">Auth0 ID</dt>
            <dd className="font-medium text-zinc-800 break-all">{session.user.sub ?? '—'}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/catalog"
            className="rounded-xl bg-[#D97706] px-5 py-3 text-center font-semibold text-white transition hover:bg-amber-500"
          >
            Перейти в каталог
          </Link>
          <Link
            href="/auth/logout"
            className="rounded-xl border border-[#A0785A] bg-white px-5 py-3 text-center font-semibold text-[#8B5E3C] transition hover:bg-amber-50"
          >
            Logout
          </Link>
        </div>

        <div className="mt-8 border-t border-amber-100 pt-6">
          <h2 className="font-serif text-2xl font-bold text-[#8B5E3C]">История заказов</h2>

          {orders.length === 0 ? (
            <p className="mt-3 text-zinc-600">У вас пока нет заказов.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {orders.map((order) => (
                <article key={order.id} className="rounded-xl border border-amber-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-zinc-800">Заказ #{order.id}</p>
                      <p className="text-sm text-zinc-500">
                        {new Intl.DateTimeFormat('ru-RU', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        }).format(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#8B5E3C]">€{Number(order.totalPrice ?? 0).toFixed(2)}</p>
                      <p className="text-sm text-zinc-600">Статус: {order.status.toLowerCase()}</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-zinc-700">
                    <p>Метод доставки: {order.shippingMethod?.name || '—'}</p>
                    <p>
                      Адрес: {order.address
                        ? `${order.address.street || ''}, ${order.address.postalCode || ''} ${order.address.city || ''}, ${order.address.country || ''}`
                        : '—'}
                    </p>
                  </div>

                  <ul className="mt-3 space-y-2 text-sm">
                    {order.orderItems.map((item) => (
                      <li key={item.id} className="rounded-lg bg-amber-50 px-3 py-2">
                        <div className="flex items-center justify-between gap-3">
                          <span>{item.book?.title || 'Книга'} × {item.quantity ?? 1}</span>
                          <span className="font-medium">€{Number(item.price ?? 0).toFixed(2)}</span>
                        </div>

                        {order.status === 'DELIVERED' && item.bookId ? (
                          <div className="mt-2">
                            <Link
                              href={`/catalog/${item.bookId}`}
                              className="inline-flex rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#8B5E3C] transition hover:bg-amber-100"
                            >
                              Оставить отзыв
                            </Link>
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="text-sm font-semibold text-[#8B5E3C] hover:text-amber-600"
                    >
                      Подробнее о заказе
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
