'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function CatalogHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 shadow-lg sticky top-0 z-50">
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
              className="text-white hover:text-blue-100 font-medium transition-colors"
            >
              Каталог
            </Link>
            <Link
              href="#"
              className="text-white hover:text-blue-100 font-medium transition-colors"
            >
              О нас
            </Link>
            <Link
              href="#"
              className="text-white hover:text-blue-100 font-medium transition-colors"
            >
              Контакты
            </Link>
          </nav>

          {/* Cart and Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-white hover:bg-white/20 rounded-lg transition-colors">
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>

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
          </nav>
        )}
      </div>
    </header>
  );
}
