'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiUsers } from 'react-icons/fi';
import Avatar from '@/components/ui/Avatar';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';

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
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(data => {
      if (!data.users) { router.push('/'); return; }
      setUsers(data.users);
    }).catch(() => router.push('/')).finally(() => setLoading(false));
  }, [router]);

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !currentIsAdmin }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || 'Failed to update user');
        return;
      }
      setUsers(users.map(u => u.id === userId ? { ...u, isAdmin: !currentIsAdmin } : u));
      toast.success(currentIsAdmin ? 'Admin removed' : 'User made admin');
    } catch {
      toast.error('Failed to update user');
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${pendingDelete}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || 'Failed to delete user');
        return;
      }
      setUsers(users.filter(u => u.id !== pendingDelete));
      toast.success('User deleted');
      setPendingDelete(null);
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <LoadingSpinner className="h-64" />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
      <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="input-field max-w-sm" />
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
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
                  <button onClick={() => setPendingDelete(u.id)} className="btn-ghost text-xs text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && (
          <EmptyState
            icon={<FiUsers className="w-10 h-10" />}
            title="No users found"
            description={search ? 'Try a different search term.' : 'Registered users will appear here.'}
          />
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete user"
        message="Permanently delete this user? Their listings will also be removed. This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
