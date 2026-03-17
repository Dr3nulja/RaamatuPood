'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import CartDrawer from './CartDrawer';

type HeaderProps = {
  userEmail?: string | null;
};

export default function Header({ userEmail }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAuthenticated = Boolean(userEmail);

  return (
    <header className="bg-gradient-to-r from-amber-800 to-amber-950 dark:from-amber-900 dark:to-amber-950 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 bg-white rounded-lg p-1 shadow-md group-hover:shadow-lg transition-shadow">
              <Image
                src="https://i.pinimg.com/736x/34/4e/cd/344ecd43b8dd6c2b48d0d64a7368177f.jpg"
                alt="RaamatuPood Logo"
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-white">RaamatuPood</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/catalog"
              className="text-white hover:text-amber-100 font-medium transition-colors"
            >
              Каталог
            </Link>
            <Link
              href="/about"
              className="text-white hover:text-amber-100 font-medium transition-colors"
            >
              О нас
            </Link>
            <Link
              href="/contacts"
              className="text-white hover:text-amber-100 font-medium transition-colors"
            >
              Контакты
            </Link>
          </nav>

          {/* Auth Buttons and Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <CartDrawer />

            {!isAuthenticated ? (
              <>
                <Link
                  href="/auth/login"
                  className="hidden sm:block px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/login?screen_hint=signup"
                  className="hidden sm:block px-4 py-2 bg-white text-amber-800 hover:bg-amber-50 rounded-lg transition-colors font-medium"
                >
                  Signup
                </Link>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-amber-100 text-sm max-w-44 truncate" title={userEmail || ''}>
                  {userEmail}
                </span>
                <Link
                  href="/auth/logout"
                  className="px-4 py-2 bg-white text-amber-800 hover:bg-amber-50 rounded-lg transition-colors font-medium"
                >
                  Logout
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
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
          <nav className="md:hidden mt-4 pb-4 space-y-2">
            <Link
              href="/catalog"
              className="block px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              Каталог
            </Link>
            <Link
              href="#"
              className="block px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              О нас
            </Link>
            <Link
              href="#"
              className="block px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              Контакты
            </Link>

            {!isAuthenticated ? (
              <>
                <Link
                  href="/auth/login"
                  className="block px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/login?screen_hint=signup"
                  className="block px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  Signup
                </Link>
              </>
            ) : (
              <>
                <p className="px-4 py-2 text-amber-100 text-sm break-all">{userEmail}</p>
                <Link
                  href="/auth/logout"
                  className="block px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  Logout
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
