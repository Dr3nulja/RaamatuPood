'use client';

import Link from 'next/link';
import ProfileHeader from '@/components/account/ProfileHeader';
import AccountSidebar from '@/components/account/AccountSidebar';
import OrderCard from '@/components/account/OrderCard';
import { useTranslation } from '@/hooks/useTranslation';

type AccountOrder = {
  id: number;
  totalPrice: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveryMethod: string;
  address: string;
  items: Array<{
    id: number;
    bookId: number | null;
    title: string;
    quantity: number;
    price: number;
  }>;
};

type AccountDashboardProps = {
  name: string;
  email: string;
  avatarUrl: string | null;
  orders: AccountOrder[];
};

export default function AccountDashboard({ name, email, avatarUrl, orders }: AccountDashboardProps) {
  const { t } = useTranslation();

  const navItems = [
    { href: '#profile', label: t('profile.title') },
    { href: '#orders', label: t('profile.orders.title') },
    { href: '/api/auth/logout', label: t('profile.logout') },
  ];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#faf7f2_0%,#ffffff_100%)] px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        <AccountSidebar items={navItems} />

        <div className="space-y-6">
          <section id="profile" className="scroll-mt-28">
            <ProfileHeader name={name} email={email} avatarUrl={avatarUrl} onEdit={() => {}} />
          </section>

          <section id="orders" className="scroll-mt-28 rounded-[2rem] border border-amber-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">{t('profile.orders.title')}</p>
                <h2 className="mt-2 font-serif text-3xl font-bold text-zinc-900">{t('profile.orderHistory')}</h2>
                <p className="mt-2 text-sm text-zinc-500">{t('profile.ordersDescription')}</p>
              </div>

              <Link
                href="/catalog"
                className="inline-flex w-fit items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-amber-100"
              >
                {t('profile.continueShopping')}
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-amber-200 bg-amber-50/60 px-6 py-10 text-center">
                <p className="text-lg font-semibold text-zinc-900">{t('profile.orders.empty')}</p>
                <p className="mt-2 text-sm text-zinc-600">{t('profile.ordersDescription')}</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-5">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}