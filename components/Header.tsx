'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import CartDrawer from './CartDrawer';
import { useCartStore } from '@/stores/cartStore';

type HeaderProps = {
  userEmail?: string | null;
  userNickname?: string | null;
  userPicture?: string | null;
  isAdmin?: boolean;
};

export default function Header({ userEmail, userNickname, userPicture, isAdmin = false }: HeaderProps) {
  const cart = useCartStore((state) => state.cart);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);
  const displayName = userNickname?.trim() || userEmail?.trim() || 'Пользователь';
  const isAuthenticated = Boolean(userEmail || userNickname);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const safeTotalItems = mounted ? totalItems : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const onScroll = () => {
      if (tickingRef.current) {
        return;
      }

      tickingRef.current = true;
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        if (currentScrollY <= 0) {
          setIsHeaderVisible(true);
        } else if (currentScrollY < lastScrollYRef.current) {
          setIsHeaderVisible(true);
        } else if (currentScrollY > lastScrollYRef.current) {
          setIsHeaderVisible(false);
        }

        lastScrollYRef.current = currentScrollY;
        tickingRef.current = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('raamatupood-cart');
      document.cookie = 'raamatupood-cart-sync=; Path=/; Max-Age=0; SameSite=Lax';
      sessionStorage.clear();
    } catch {
      // ignore browser storage errors
    }

    window.location.assign('/api/auth/logout');
  };

  return (
    <>
    <header className={`fixed left-0 right-0 top-0 z-50 border-b border-amber-100/70 bg-white/80 backdrop-blur-xl transition-transform duration-300 will-change-transform dark:border-zinc-800/70 dark:bg-zinc-950/75 ${
      isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-11 w-11 rounded-lg bg-amber-50 p-1 shadow-sm transition-shadow group-hover:shadow-md">
              <Image
                src="https://i.pinimg.com/736x/34/4e/cd/344ecd43b8dd6c2b48d0d64a7368177f.jpg"
                alt="RaamatuPood Logo"
                fill
                sizes="44px"
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
              className="inline-flex items-center rounded-lg px-2 py-1 font-medium text-zinc-700 transition-[color,background-color,transform,box-shadow] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:bg-amber-50/80 hover:text-amber-700 hover:shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-amber-300 dark:focus-visible:ring-amber-400 dark:focus-visible:ring-offset-zinc-950"
            >
              Главная
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center rounded-lg px-2 py-1 font-medium text-zinc-700 transition-[color,background-color,transform,box-shadow] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:bg-amber-50/80 hover:text-amber-700 hover:shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-amber-300 dark:focus-visible:ring-amber-400 dark:focus-visible:ring-offset-zinc-950"
            >
              Каталог
            </Link>
            <Link
              href="/account"
              className="inline-flex items-center rounded-lg px-2 py-1 font-medium text-zinc-700 transition-[color,background-color,transform,box-shadow] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:bg-amber-50/80 hover:text-amber-700 hover:shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-amber-300 dark:focus-visible:ring-amber-400 dark:focus-visible:ring-offset-zinc-950"
            >
              Моя библиотека
            </Link>
            <Link
              href="/contacts"
              className="inline-flex items-center rounded-lg px-2 py-1 font-medium text-zinc-700 transition-[color,background-color,transform,box-shadow] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:bg-amber-50/80 hover:text-amber-700 hover:shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-amber-300 dark:focus-visible:ring-amber-400 dark:focus-visible:ring-offset-zinc-950"
            >
              Контакты
            </Link>
          </nav>




          {/* Auth Buttons and Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Open cart"
              onClick={() => setIsCartOpen(true)}
              className="relative rounded-lg p-2 text-zinc-700 transition-[color,background-color,transform,box-shadow] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:bg-amber-50 hover:text-amber-700 hover:shadow-sm active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:ring-amber-400 dark:focus-visible:ring-offset-zinc-950"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {safeTotalItems > 0 && (
                <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full bg-amber-700 px-1 text-center text-xs font-bold leading-5 text-white">
                  {safeTotalItems}
                </span>
              )}
            </button>

            {!isAuthenticated ? (
              <>
                <Link
                  href="/auth/login?prompt=login"
                  className="hidden sm:block rounded-lg border-2 border-amber-700 px-4 py-2.5 font-semibold text-amber-700 transition-[color,background-color,transform,box-shadow,border-color] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:bg-amber-700 hover:text-white hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-400 dark:hover:text-black dark:focus-visible:ring-amber-300 dark:focus-visible:ring-offset-zinc-950"
                >
                  Вход
                </Link>
                <Link
                  href="/auth/login?screen_hint=signup&prompt=login"
                  className="hidden sm:block rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-2.5 font-semibold text-white transition-[transform,box-shadow,opacity] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-md hover:shadow-amber-600/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:from-amber-500 dark:to-amber-600 dark:hover:shadow-amber-500/40 dark:focus-visible:ring-amber-300 dark:focus-visible:ring-offset-zinc-950"
                >
                  Регистрация
                </Link>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                {userPicture ? (
                  <Link
                    href="/account"
                    aria-label="Открыть профиль"
                    className="relative group rounded-full transition-transform duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-amber-400 dark:focus-visible:ring-offset-zinc-950"
                  >
                    <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 blur opacity-0 transition duration-300 group-hover:opacity-100"></div>
                    <Image
                      src={userPicture}
                      alt="User avatar"
                      width={36}
                      height={36}
                      className="relative rounded-full border-2 border-white shadow-md object-cover dark:border-zinc-800"
                    />
                  </Link>
                ) : (
                  <Link
                    href="/account"
                    aria-label="Открыть профиль"
                    className="relative h-9 w-9 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 border-2 border-white shadow-md transition-transform duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-zinc-800 dark:focus-visible:ring-amber-400 dark:focus-visible:ring-offset-zinc-950"
                  />
                )}
                <div className="flex flex-col hidden lg:block">
                  <span className="max-w-48 truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100" title={displayName}>
                    {displayName}
                  </span>
                </div>
                <Link
                  href="/account"
                  className="rounded-lg px-4 py-2 font-medium text-zinc-700 transition-[color,background-color,transform,box-shadow] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:bg-amber-50 hover:text-amber-700 hover:shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:ring-amber-400 dark:focus-visible:ring-offset-zinc-950"
                >
                  Кабинет
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-lg px-4 py-2 font-medium text-red-600 transition-[color,background-color,transform,box-shadow] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-red-400 dark:hover:bg-red-900/20 dark:focus-visible:ring-red-400 dark:focus-visible:ring-offset-zinc-950"
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-[background-color,transform,box-shadow] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-md hover:shadow-red-600/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-red-400 dark:focus-visible:ring-offset-zinc-950"
                >
                  Выход
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="rounded-lg p-2 text-zinc-700 transition-[color,background-color,opacity] duration-150 ease-out hover:bg-amber-50 hover:text-amber-700 active:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 dark:focus-visible:ring-amber-400 dark:focus-visible:ring-offset-zinc-950 md:hidden"
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
              className="block rounded-lg px-4 py-2 text-zinc-700 transition-[color,background-color,opacity] duration-150 ease-out hover:bg-amber-50 hover:text-amber-700 active:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 dark:focus-visible:ring-amber-400 dark:focus-visible:ring-offset-zinc-950"
            >
              Главная
            </Link>
            <Link
              href="/catalog"
              className="block rounded-lg px-4 py-2 text-zinc-700 transition-[color,background-color,opacity] duration-150 ease-out hover:bg-amber-50 hover:text-amber-700 active:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 dark:focus-visible:ring-amber-400 dark:focus-visible:ring-offset-zinc-950"
            >
              Каталог
            </Link>
            <Link
              href="/account"
              className="block rounded-lg px-4 py-2 text-zinc-700 transition-[color,background-color,opacity] duration-150 ease-out hover:bg-amber-50 hover:text-amber-700 active:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 dark:focus-visible:ring-amber-400 dark:focus-visible:ring-offset-zinc-950"
            >
              Моя библиотека
            </Link>
            <Link
              href="/contacts"
              className="block rounded-lg px-4 py-2 text-zinc-700 transition-[color,background-color,opacity] duration-150 ease-out hover:bg-amber-50 hover:text-amber-700 active:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 dark:focus-visible:ring-amber-400 dark:focus-visible:ring-offset-zinc-950"
            >
              Контакты
            </Link>



            {!isAuthenticated ? (
              <>
                <Link
                  href="/auth/login?prompt=login"
                  className="block rounded-lg border-2 border-amber-700 px-4 py-2 font-medium text-amber-700 transition-[color,background-color,opacity,border-color] duration-150 ease-out hover:bg-amber-50 active:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-amber-400 dark:text-amber-400 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 dark:focus-visible:ring-amber-400 dark:focus-visible:ring-offset-zinc-950"
                >
                  Вход
                </Link>
                <Link
                  href="/auth/login?screen_hint=signup&prompt=login"
                  className="block rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-2 font-medium text-white transition-[opacity,box-shadow,background-color] duration-150 ease-out hover:opacity-95 hover:shadow-md hover:shadow-amber-600/30 active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:from-amber-500 dark:to-amber-600 dark:focus-visible:ring-amber-400 dark:focus-visible:ring-offset-zinc-950"
                >
                  Регистрация
                </Link>
              </>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-amber-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    {userPicture ? (
                      <Link
                        href="/account"
                        aria-label="Открыть профиль"
                        className="relative rounded-full transition-[opacity,background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-amber-400 dark:focus-visible:ring-offset-zinc-950"
                      >
                        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 blur opacity-75"></div>
                        <Image
                          src={userPicture}
                          alt="User avatar"
                          width={40}
                          height={40}
                          className="relative rounded-full border-2 border-white shadow-md object-cover dark:border-zinc-800"
                        />
                      </Link>
                    ) : (
                      <Link
                        href="/account"
                        aria-label="Открыть профиль"
                        className="relative h-10 w-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 border-2 border-white shadow-md transition-[opacity,background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-zinc-800 dark:focus-visible:ring-amber-400 dark:focus-visible:ring-offset-zinc-950"
                      />
                    )}
                    <div>
                      <p className="break-all text-sm font-semibold text-zinc-800 dark:text-zinc-100 line-clamp-1">{displayName}</p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/account"
                  className="block rounded-lg px-4 py-2 text-zinc-700 transition-[color,background-color,opacity] duration-150 ease-out hover:bg-amber-50 hover:text-amber-700 active:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 dark:focus-visible:ring-amber-400 dark:focus-visible:ring-offset-zinc-950"
                >
                  Кабинет
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block rounded-lg px-4 py-2 text-red-600 transition-[color,background-color,opacity] duration-150 ease-out hover:bg-red-50 active:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-red-400 dark:hover:bg-red-900/20 dark:active:bg-red-900/30 dark:focus-visible:ring-red-400 dark:focus-visible:ring-offset-zinc-950"
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-4 py-2 text-left text-red-600 transition-[color,background-color,opacity] duration-150 ease-out hover:bg-red-50 active:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-red-400 dark:hover:bg-red-900/20 dark:active:bg-red-900/30 dark:focus-visible:ring-red-400 dark:focus-visible:ring-offset-zinc-950"
                >
                  Выход
                </button>
              </>
            )}
          </nav>
        )}
      </div>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} isAuthenticated={isAuthenticated} />
    </header>
    <div aria-hidden className="h-[76px]" />
    </>
  );
}
