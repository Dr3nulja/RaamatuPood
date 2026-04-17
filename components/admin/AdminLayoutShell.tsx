'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type AdminLayoutShellProps = {
  children: React.ReactNode;
};

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/books', label: 'Books' },
  { href: '/admin/authors', label: 'Authors' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/orders', label: 'Orders' },
];

function getIsActive(pathname: string, href: string) {
  if (href === '/admin') {
    return pathname === '/admin';
  }

  return pathname.startsWith(href);
}

export default function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-background-muted px-4 py-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:h-fit">
          <h1 className="font-serif text-2xl font-bold text-secondary">Admin Panel</h1>
          <p className="mt-1 text-sm text-zinc-500">CRM интернет-библиотеки</p>

          <nav className="mt-5 space-y-2">
            {links.map((link) => {
              const isActive = getIsActive(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-amber-100 text-amber-900'
                      : 'text-zinc-700 hover:bg-amber-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="space-y-6">{children}</section>
      </div>
    </main>
  );
}
