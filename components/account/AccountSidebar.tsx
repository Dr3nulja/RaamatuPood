'use client';

import Link from 'next/link';

type NavItem = {
  href: string;
  label: string;
};

type AccountSidebarProps = {
  items: NavItem[];
};

export default function AccountSidebar({ items }: AccountSidebarProps) {
  return (
    <aside className="rounded-[2rem] border border-amber-100 bg-white p-4 shadow-sm md:sticky md:top-24 md:p-5">
      <div className="mb-4 hidden md:block">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Account</p>
      </div>

      <nav className="flex gap-2 overflow-x-auto md:flex-col md:gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="min-w-max rounded-2xl border border-transparent bg-amber-50 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-amber-200 hover:bg-amber-100 hover:text-zinc-900 md:min-w-0"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}