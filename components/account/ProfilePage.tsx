'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProfileHeader from '@/components/account/ProfileHeader';
import AccountSidebar from '@/components/account/AccountSidebar';
import OrderCard from '@/components/account/OrderCard';
import EditProfileModal from '@/components/account/EditProfileModal';
import Button from '@/components/ui/Button';
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

type ProfilePageProps = {
  name: string;
  email: string;
  avatarUrl: string | null;
  registeredAt?: string | null;
  orders: AccountOrder[];
};

export default function ProfilePage({ name, email, avatarUrl, registeredAt, orders }: ProfilePageProps) {
  const { t } = useTranslation();
  const [profileName, setProfileName] = useState(name);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(avatarUrl);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const navItems = [
    { href: '#profile', label: t('profile.title') },
    { href: '#orders', label: t('profile.orders.title') },
    { href: '#settings', label: t('profile.settings') },
    { href: '/api/auth/logout', label: t('profile.logout') },
  ];

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleSaveProfile = async ({ username, avatar }: { username: string; avatar: File | null }) => {
    try {
      const formData = new FormData();
      formData.set('username', username);
      if (avatar) {
        formData.set('avatar', avatar);
      }

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        user?: { name?: string | null; picture?: string | null };
        error?: string;
        message?: string;
      } | null;

      if (!response.ok || !payload?.user) {
        if (payload?.error === 'username_taken') {
          showToast(t('profile.usernameTaken'));
          return;
        }

        if (payload?.error === 'unauthorized') {
          showToast(t('errors.unauthorized'));
          return;
        }

        showToast(payload?.message || payload?.error || t('profile.updateError'));
        return;
      }

      setProfileName(payload.user.name || username || profileName);
      setProfileAvatarUrl(payload.user.picture || profileAvatarUrl);
      setIsEditOpen(false);
      showToast(t('profile.updateSuccess'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.network');
      showToast(message);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#faf7f2_0%,#ffffff_100%)] px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        <AccountSidebar items={navItems} />

        <div className="space-y-6">
          <section id="profile" className="scroll-mt-28">
            <ProfileHeader
              name={profileName}
              email={email}
              avatarUrl={profileAvatarUrl}
              registeredAt={registeredAt}
              onEdit={() => setIsEditOpen(true)}
            />
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

          <section id="settings" className="scroll-mt-28 rounded-[2rem] border border-amber-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">{t('profile.settings')}</p>
                <h2 className="mt-2 text-2xl font-bold text-zinc-900">{t('profile.profileControls')}</h2>
                <p className="mt-2 text-sm text-zinc-500">{t('profile.settingsDescription')}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(true)}
                  className="rounded-full border-amber-200 bg-amber-50 text-zinc-700 hover:bg-amber-100"
                >
                  {t('profile.editProfile')}
                </Button>
                <Link
                  href="/auth/login?prompt=login"
                  className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-amber-50"
                >
                  {t('profile.changePassword')}
                </Link>
                <Link
                  href="/api/auth/logout"
                  className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  {t('profile.logout')}
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-[60] rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white shadow-2xl">
          {toast}
        </div>
      ) : null}

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        currentName={profileName}
        currentAvatarUrl={profileAvatarUrl}
        onSave={handleSaveProfile}
      />
    </main>
  );
}