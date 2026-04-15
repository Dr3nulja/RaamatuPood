'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import CartDrawer from './CartDrawer';
import { useCartStore } from '@/stores/cartStore';

type HeaderProps = {
  userEmail?: string | null;
  userPicture?: string | null;
  isAdmin?: boolean;
};

export default function Header({ userEmail, userPicture, isAdmin = false }: HeaderProps) {
  const cart = useCartStore((state) => state.cart);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);
  const isAuthenticated = Boolean(userEmail);
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
            <button
              type="button"
              aria-label="Open cart"
              onClick={() => setIsCartOpen(true)}
              className="relative rounded-lg p-2 text-zinc-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
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
                  className="hidden sm:block rounded-lg px-4 py-2.5 font-semibold text-amber-700 border-2 border-amber-700 transition-all duration-200 hover:bg-amber-700 hover:text-white hover:shadow-lg dark:text-amber-400 dark:border-amber-400 dark:hover:bg-amber-400 dark:hover:text-black"
                >
                  Вход
                </Link>
                <Link
                  href="/auth/login?screen_hint=signup&prompt=login"
                  className="hidden sm:block rounded-lg px-6 py-2.5 font-semibold bg-gradient-to-r from-amber-600 to-amber-700 text-white transition-all duration-200 hover:shadow-lg hover:shadow-amber-600/50 hover:-translate-y-0.5 dark:from-amber-500 dark:to-amber-600 dark:hover:shadow-amber-500/50"
                >
                  Регистрация
                </Link>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                {userPicture ? (
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    <Image
                      src={userPicture}
                      alt="User avatar"
                      width={36}
                      height={36}
                      className="relative rounded-full border-2 border-white shadow-md object-cover dark:border-zinc-800"
                    />
                  </div>
                ) : (
                  <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 border-2 border-white shadow-md dark:border-zinc-800" />
                )}
                <div className="flex flex-col hidden lg:block">
                  <span className="max-w-48 truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">Профиль</span>
                  <span className="max-w-48 truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100" title={userEmail || ''}>
                    {userEmail}
                  </span>
                </div>
                <Link
                  href="/account"
                  className="rounded-lg px-4 py-2 font-medium text-zinc-700 transition-all duration-200 hover:bg-amber-50 hover:text-amber-700 dark:text-zinc-100 dark:hover:bg-zinc-800 hover:shadow-sm"
                >
                  Кабинет
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-lg px-4 py-2 font-medium text-red-600 transition-all duration-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 hover:shadow-sm"
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-4 py-2 font-medium text-white bg-red-600 transition-all duration-200 hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/50"
                >
                  Выход
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



            {!isAuthenticated ? (
              <>
                <Link
                  href="/auth/login?prompt=login"
                  className="block rounded-lg px-4 py-2 font-medium text-amber-700 border-2 border-amber-700 transition-all duration-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-400 dark:hover:bg-zinc-800"
                >
                  Вход
                </Link>
                <Link
                  href="/auth/login?screen_hint=signup&prompt=login"
                  className="block rounded-lg px-4 py-2 font-medium bg-gradient-to-r from-amber-600 to-amber-700 text-white transition-all duration-200 hover:shadow-lg hover:shadow-amber-600/50 dark:from-amber-500 dark:to-amber-600"
                >
                  Регистрация
                </Link>
              </>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-amber-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    {userPicture ? (
                      <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full blur opacity-75"></div>
                        <Image
                          src={userPicture}
                          alt="User avatar"
                          width={40}
                          height={40}
                          className="relative rounded-full border-2 border-white shadow-md object-cover dark:border-zinc-800"
                        />
                      </div>
                    ) : (
                      <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 border-2 border-white shadow-md dark:border-zinc-800" />
                    )}
                    <div>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Профиль</p>
                      <p className="break-all text-sm font-semibold text-zinc-800 dark:text-zinc-100 line-clamp-1">{userEmail}</p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/account"
                  className="block rounded-lg px-4 py-2 text-zinc-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  Кабинет
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block rounded-lg px-4 py-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-left rounded-lg px-4 py-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
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
