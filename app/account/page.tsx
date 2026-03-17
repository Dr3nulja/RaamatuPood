import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect('/auth/login?returnTo=/account');
  }

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
      </section>
    </main>
  );
}
