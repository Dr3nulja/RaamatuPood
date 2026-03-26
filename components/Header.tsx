'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import CartDrawer from './CartDrawer';

type HeaderProps = {
  userEmail?: string | null;
  userPicture?: string | null;
  isAdmin?: boolean;
};

export default function Header({ userEmail, userPicture, isAdmin = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const isAuthenticated = Boolean(userEmail);

  const handleLogout = () => {
    try {
      localStorage.removeItem('raamatupood-cart');
      sessionStorage.clear();
    } catch {
      // ignore browser storage errors
    }

    window.location.assign('/api/auth/logout');
  };

  const handleHeaderSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = headerSearch.trim();
    if (!value) {
      window.location.assign('/catalog');
      return;
    }

    window.location.assign(`/catalog?search=${encodeURIComponent(value)}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-amber-100/70 bg-white/80 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/75">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-11 w-11 rounded-lg bg-amber-50 p-1 shadow-sm transition-shadow group-hover:shadow-md">
              <Image
                src="https://i.pinimg.com/736x/34/4e/cd/344ecd43b8dd6c2b48d0d64a7368177f.jpg"
                alt="RaamatuPood Logo"
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100">RaamatuPood</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="font-medium text-zinc-700 transition-colors hover:text-amber-700 dark:text-zinc-200 dark:hover:text-amber-300"
            >
              Главная
            </Link>
            <Link
              href="/catalog"
              className="font-medium text-zinc-700 transition-colors hover:text-amber-700 dark:text-zinc-200 dark:hover:text-amber-300"
            >
              Каталог
            </Link>
            <Link
              href="/account"
              className="font-medium text-zinc-700 transition-colors hover:text-amber-700 dark:text-zinc-200 dark:hover:text-amber-300"
            >
              Моя библиотека
            </Link>
            <Link
              href="/contacts"
              className="font-medium text-zinc-700 transition-colors hover:text-amber-700 dark:text-zinc-200 dark:hover:text-amber-300"
            >
              Контакты
            </Link>
          </nav>


          {/* Auth Buttons and Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <CartDrawer isAuthenticated={isAuthenticated} />

            {!isAuthenticated ? (
              <>
                <Link
                  href="/auth/login?prompt=login"
                  className="hidden rounded-lg px-4 py-2 font-medium text-zinc-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-zinc-100 dark:hover:bg-zinc-800 sm:block"
                >
                  Login
                </Link>
                <Link
                  href="/auth/login?screen_hint=signup&prompt=login"
                  className="hidden rounded-lg bg-amber-700 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-800 sm:block"
                >
                  Signup
                </Link>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                {userPicture ? (
                  <Image
                    src={userPicture}
                    alt="User avatar"
                    width={28}
                    height={28}
                    className="rounded-full border border-amber-100"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-amber-100" />
                )}
                <span className="max-w-44 truncate text-sm text-zinc-600 dark:text-zinc-300" title={userEmail || ''}>
                  {userEmail}
                </span>
                <Link
                  href="/account"
                  className="rounded-lg px-4 py-2 font-medium text-zinc-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  Кабинет
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-lg px-4 py-2 font-medium text-zinc-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg bg-amber-700 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-800"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="rounded-lg p-2 text-zinc-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-zinc-100 dark:hover:bg-zinc-800 md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="mt-4 space-y-2 pb-4 md:hidden">
            <Link
              href="/"
              className="block rounded-lg px-4 py-2 text-zinc-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Главная
            </Link>
            <Link
              href="/catalog"
              className="block rounded-lg px-4 py-2 text-zinc-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Каталог
            </Link>
            <Link
              href="/account"
              className="block rounded-lg px-4 py-2 text-zinc-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Моя библиотека
            </Link>
            <Link
              href="/contacts"
              className="block rounded-lg px-4 py-2 text-zinc-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Контакты
            </Link>

            <form onSubmit={handleHeaderSearchSubmit} className="px-4 pt-1">
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <svg className="h-4 w-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6 6a7.5 7.5 0 0 0 10.65 10.65Z" />
                </svg>
                <input
                  type="text"
                  value={headerSearch}
                  onChange={(event) => setHeaderSearch(event.target.value)}
                  placeholder="Поиск книг"
                  className="w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-500 dark:text-zinc-100"
                />
              </div>
            </form>

            {!isAuthenticated ? (
              <>
                <Link
                  href="/auth/login?prompt=login"
                  className="block rounded-lg px-4 py-2 text-zinc-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  Login
                </Link>
                <Link
                  href="/auth/login?screen_hint=signup&prompt=login"
                  className="block rounded-lg px-4 py-2 text-zinc-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  Signup
                </Link>
              </>
            ) : (
              <>
                {userPicture ? (
                  <Image
                    src={userPicture}
                    alt="User avatar"
                    width={28}
                    height={28}
                    className="mx-4 rounded-full border border-amber-100"
                  />
                ) : null}
                <p className="break-all px-4 py-2 text-sm text-zinc-600 dark:text-zinc-300">{userEmail}</p>
                <Link
                  href="/account"
                  className="block rounded-lg px-4 py-2 text-zinc-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  Кабинет
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block rounded-lg px-4 py-2 text-zinc-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block rounded-lg px-4 py-2 text-zinc-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
