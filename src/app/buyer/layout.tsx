'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { FiHeart, FiSearch, FiMessageSquare, FiPackage, FiShoppingBag } from 'react-icons/fi';

const sidebarLinks = [
  { title: 'Dashboard', href: '/buyer/dashboard', icon: FiShoppingBag },
  { title: 'Browse', href: '/categories', icon: FiSearch },
  { title: 'Favorites', href: '/favorites', icon: FiHeart },
  { title: 'Messages', href: '/messages', icon: FiMessageSquare },
];

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56db]" /></div>;
  if (!authorized) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-gray-50 hidden md:block">
        <div className="p-6">
          <h2 className="text-lg font-bold text-[#1a56db]">Buyer Hub</h2>
          <p className="text-xs text-gray-500 mt-1">Find great deals</p>
        </div>
        <nav className="space-y-1 px-3">
          {sidebarLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                link.href === '/buyer/dashboard' ? 'bg-[#1a56db]/10 text-[#1a56db]' : 'text-gray-600 hover:bg-gray-100'
              )}>
              <link.icon className="h-5 w-5" />{link.title}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
