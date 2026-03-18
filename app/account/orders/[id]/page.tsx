import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AccountOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth0.getSession();

  if (!session?.user?.sub) {
    redirect('/auth/login?returnTo=/account');
  }

  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { auth0Id: session.user.sub },
    select: { id: true },
  });

  if (!user) {
    redirect('/account');
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: user.id,
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
    <main className="min-h-screen bg-[#FDF8F0] px-4 py-10">
      <section className="mx-auto max-w-3xl rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-3xl font-bold text-[#8B5E3C]">Заказ #{order.id}</h1>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
            {order.status.toLowerCase()}
          </span>
        </div>

        <p className="mt-2 text-zinc-600">
          {new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          }).format(order.createdAt)}
        </p>

        <div className="mt-6 rounded-xl border border-amber-100 p-4">
          <h2 className="font-semibold text-zinc-800">Доставка</h2>
          <p className="mt-2 text-sm text-zinc-700">Метод: {order.shippingMethod?.name || '—'}</p>
          <p className="mt-1 text-sm text-zinc-700">
            Адрес: {order.address
              ? `${order.address.street || ''}, ${order.address.postalCode || ''} ${order.address.city || ''}, ${order.address.country || ''}`
              : '—'}
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-amber-100 p-4">
          <h2 className="font-semibold text-zinc-800">Книги</h2>
          <ul className="mt-3 space-y-2">
            {order.orderItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-sm">
                <span>{item.book?.title || 'Книга'} × {item.quantity ?? 1}</span>
                <span className="font-medium">€{Number(item.price ?? 0).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-amber-100 pt-4">
          <span className="text-zinc-700">Итого</span>
          <span className="text-xl font-bold text-[#8B5E3C]">€{Number(order.totalPrice ?? 0).toFixed(2)}</span>
        </div>

        <div className="mt-6">
          <Link
            href="/account"
            className="rounded-xl border border-[#A0785A] bg-white px-5 py-3 text-sm font-semibold text-[#8B5E3C] transition hover:bg-amber-50"
          >
            Назад в кабинет
          </Link>
        </div>
      </section>
    </main>
  );
}
