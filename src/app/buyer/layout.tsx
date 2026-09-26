'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { FiHeart, FiSearch, FiMessageSquare, FiShoppingBag } from 'react-icons/fi';

const sidebarLinks = [
  { title: 'Dashboard', href: '/buyer/dashboard', icon: FiShoppingBag, exact: true },
  { title: 'Browse', href: '/categories', icon: FiSearch, exact: true },
  { title: 'Favorites', href: '/favorites', icon: FiHeart },
  { title: 'Messages', href: '/messages', icon: FiMessageSquare },
];

const isLinkActive = (pathname: string, link: { href: string; exact?: boolean }) =>
  link.exact ? pathname === link.href : pathname.startsWith(link.href);

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (!data.user || (data.user.role !== 'buyer' && !data.user.isAdmin)) {
          router.push('/');
          return;
        }
        setAuthorized(true);
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <LoadingSpinner className="h-screen" />;
  if (!authorized) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-gray-50 hidden md:block">
        <div className="p-6">
          <h2 className="text-lg font-bold text-bai-blue">Buyer Hub</h2>
          <p className="text-xs text-gray-500 mt-1">Find great deals</p>
        </div>
        <nav className="space-y-1 px-3">
          {sidebarLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className={cn('flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors',
                isLinkActive(pathname, link) ? 'bg-bai-blue-light text-bai-blue' : 'text-gray-600 hover:bg-gray-100'
              )}>
              <link.icon className="h-5 w-5" />{link.title}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <nav className="md:hidden flex gap-2 overflow-x-auto px-4 py-3 border-b border-gray-100 bg-gray-50 sticky top-16 z-30">
          {sidebarLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className={cn('flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-2xl text-xs font-medium transition-colors',
                isLinkActive(pathname, link)
                  ? 'bg-bai-blue-light text-bai-blue font-bold'
                  : 'bg-white text-gray-600 border border-gray-200'
              )}>
              <link.icon className="h-4 w-4" />
              {link.title}
            </Link>
          ))}
        </nav>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
