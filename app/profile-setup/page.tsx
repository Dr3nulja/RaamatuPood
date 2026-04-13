'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type AuthStatusResponse = {
  state: 'unauthenticated' | 'verify-email' | 'profile-setup' | 'ready';
  user: {
    email: string | null;
    emailVerified: boolean;
  } | null;
  profile: {
    username: string | null;
    avatarUrl: string | null;
  } | null;
};

const USERNAME_HINT = '3-20 chars, letters/numbers/_/- only';

export default function ProfileSetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/account';
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [authState, setAuthState] = useState<'loading' | 'profile-setup'>('loading');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadStatus = async () => {
      const response = await fetch('/api/auth/status', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
      });

      const payload = (await response.json()) as AuthStatusResponse;
      if (cancelled) {
        return;
      }

      if (payload.state === 'unauthenticated') {
        router.replace(`/auth/login?returnTo=${encodeURIComponent('/profile-setup')}`);
        return;
      }

      if (payload.state === 'verify-email') {
        router.replace('/verify-email');
        return;
      }

      if (payload.state === 'ready') {
        router.replace(returnTo);
        return;
      }

      setAuthEmail(payload.user?.email || '');
      setAuthState('profile-setup');
    };

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, [returnTo, router]);

  const isUsernameLocallyValid = useMemo(() => /^[A-Za-z0-9_-]{3,20}$/.test(username.trim()), [username]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmed = username.trim();
    if (!/^[A-Za-z0-9_-]{3,20}$/.test(trimmed)) {
      setError('Username must be 3-20 chars and use only letters, numbers, _ or -.');
      return;
    }

    if (!avatarFile) {
      setError('Avatar image is required.');
      return;
    }

    if (!avatarFile.type.startsWith('image/')) {
      setError('Avatar must be an image file.');
      return;
    }

    if (avatarFile.size > 2 * 1024 * 1024) {
      setError('Avatar must be <= 2MB.');
      return;
    }

    const body = new FormData();
    body.set('username', trimmed);
    body.set('avatar', avatarFile);

    setSubmitting(true);
    try {
      const response = await fetch('/api/profile/setup', {
        method: 'POST',
        body,
        credentials: 'include',
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string; message?: string };

      if (!response.ok) {
        setError(data.message || data.error || 'Failed to save profile.');
        return;
      }

      setSuccess('Profile saved. Redirecting...');
      router.replace(returnTo);
      router.refresh();
    } catch {
      setError('Unexpected error while saving your profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authState === 'loading') {
    return (
      <main className="min-h-screen bg-[#FDF8F0] px-4 py-10">
        <section className="mx-auto max-w-xl rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <h1 className="font-serif text-3xl font-bold text-[#8B5E3C]">Profile Setup</h1>
          <p className="mt-3 text-zinc-700">Checking your authentication status...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDF8F0] px-4 py-10">
      <section className="mx-auto max-w-xl rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
        <h1 className="font-serif text-3xl font-bold text-[#8B5E3C]">Complete Your Profile</h1>
        <p className="mt-2 text-zinc-700">Set your username and avatar to continue.</p>
        {authEmail ? <p className="mt-1 text-sm text-zinc-600">Signed in as {authEmail}</p> : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">Username</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              minLength={3}
              maxLength={20}
              pattern="[A-Za-z0-9_-]{3,20}"
              className="w-full rounded-xl border border-amber-200 px-3 py-2 text-zinc-900 outline-none ring-amber-200 focus:ring"
              placeholder="your_username"
            />
            <span className="mt-1 block text-xs text-zinc-500">{USERNAME_HINT}</span>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">Avatar Image</span>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
              className="block w-full rounded-xl border border-amber-200 px-3 py-2 text-sm text-zinc-800"
            />
            <span className="mt-1 block text-xs text-zinc-500">Image only, max 2MB.</span>
          </label>

          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {success ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

          <button
            type="submit"
            disabled={submitting || !isUsernameLocallyValid || !avatarFile}
            className="rounded-xl bg-[#D97706] px-5 py-3 font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </section>
    </main>
  );
}
