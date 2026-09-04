'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  avatar?: string;
  _count?: { listings: number };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(data => {
      if (!data.users) { router.push('/'); return; }
      setUsers(data.users);
    }).catch(() => router.push('/')).finally(() => setLoading(false));
  }, [router]);

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAdmin: !currentIsAdmin }),
    });
    setUsers(users.map(u => u.id === userId ? { ...u, isAdmin: !currentIsAdmin } : u));
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Delete this user?')) return;
    await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    setUsers(users.filter(u => u.id !== userId));
  };

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bai-blue" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>
      <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="input-field max-w-sm" />
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="text-left p-3">User</th><th className="text-left p-3">Email</th><th className="text-left p-3">Role</th><th className="text-left p-3">Joined</th><th className="text-right p-3">Actions</th></tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-3"><div className="flex items-center gap-2"><Avatar name={u.name} src={u.avatar} size="sm" /><span className="font-medium">{u.name}</span></div></td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.isAdmin ? <span className="badge badge-red">Admin</span> : <span className="badge badge-gray">User</span>}</td>
                <td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => handleToggleAdmin(u.id, u.isAdmin)} className="btn-ghost text-xs">{u.isAdmin ? 'Remove Admin' : 'Make Admin'}</button>
                  <button onClick={() => handleDelete(u.id)} className="btn-ghost text-xs text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
