import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';

export const dynamic = 'force-dynamic';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const session = await auth0.getSession();
  const params = await searchParams;
  const returnTo = params.returnTo || '/account';

  if (!session?.user?.sub) {
    redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  if (session.user.email_verified === true) {
    redirect('/profile-setup');
  }

  return (
    <main className="min-h-screen bg-[#FDF8F0] px-4 py-10">
      <section className="mx-auto max-w-xl rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
        <h1 className="font-serif text-3xl font-bold text-[#8B5E3C]">Verify Your Email</h1>
        <p className="mt-3 text-zinc-700">
          Please verify your email before continuing.
        </p>
        <p className="mt-2 text-sm text-zinc-600">
          We sent a verification link to <span className="font-medium">{session.user.email || 'your email'}</span>. Open your inbox,
          click the link, then sign in again.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/auth/login"
            className="rounded-xl bg-[#D97706] px-5 py-3 text-center font-semibold text-white transition hover:bg-amber-500"
          >
            I verified, continue
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
