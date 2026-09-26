'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { HiOutlineViewGrid, HiOutlineUsers, HiOutlineArchive, HiOutlineExclamation, HiOutlineBeaker } from 'react-icons/hi';

const sidebarLinks = [
  { title: 'Dashboard', href: '/admin', icon: HiOutlineViewGrid },
  { title: 'Users', href: '/admin/users', icon: HiOutlineUsers },
  { title: 'Listings', href: '/admin/listings', icon: HiOutlineArchive },
  { title: 'Reports', href: '/admin/reports', icon: HiOutlineExclamation },
  { title: 'Testing', href: '/admin/testing', icon: HiOutlineBeaker, devOnly: true },
];

const isLinkActive = (pathname: string, href: string) =>
  href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const visibleLinks = sidebarLinks.filter(
    (l) => !l.devOnly || process.env.NODE_ENV !== 'production'
  );

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (!data.user?.isAdmin && data.user?.role !== 'admin') { router.push('/'); return; }
        setAuthorized(true);
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <LoadingSpinner className="h-screen" />;
  if (!authorized) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-gray-100 bg-gray-50/80 backdrop-blur-sm hidden md:block">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
          <p className="text-xs text-gray-500 mt-1">Manage your marketplace</p>
        </div>
        <nav className="space-y-1 px-3">
          {visibleLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className={cn('flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isLinkActive(pathname, link.href)
                  ? 'bg-bai-blue-light text-bai-blue font-bold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}>
              <link.icon className="h-5 w-5" />
              {link.title}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <nav className="md:hidden flex gap-2 overflow-x-auto px-4 py-3 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm sticky top-16 z-30">
          {visibleLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className={cn('flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-2xl text-xs font-medium transition-colors',
                isLinkActive(pathname, link.href)
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
