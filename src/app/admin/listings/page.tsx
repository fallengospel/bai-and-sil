'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiInbox } from 'react-icons/fi';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';

interface Listing {
  id: string;
  title: string;
  status: string;
  price: number;
  createdAt: string;
  seller: { name: string };
  category: { name: string };
  images: { imageUrl: string }[];
}

export default function AdminListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/listings').then(r => r.json()).then(data => {
      if (!data.listings) { router.push('/'); return; }
      setListings(data.listings);
    }).catch(() => router.push('/')).finally(() => setLoading(false));
  }, [router]);

  const handleRemove = async (id: string) => {
    setRemoving(true);
    try {
      const res = await fetch(`/api/admin/listings/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || 'Failed to remove listing');
        return;
      }
      setListings(listings.filter(l => l.id !== id));
      toast.success('Listing removed');
      setPendingRemove(null);
    } catch {
      toast.error('Failed to remove listing');
    } finally {
      setRemoving(false);
    }
  };

  const filtered = listings.filter(l => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <LoadingSpinner className="h-64" />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Listing Management</h1>
      <div className="flex gap-4">
        <input type="text" placeholder="Search listings..." value={search} onChange={e => setSearch(e.target.value)} className="input-field max-w-sm" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field max-w-[160px]">
          <option value="ALL">All Status</option>
          <option value="Active">Active</option>
          <option value="Sold">Sold</option>
          <option value="Reserved">Reserved</option>
          <option value="Removed">Removed</option>
        </select>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-gray-50"><tr><th className="text-left p-3">Image</th><th className="text-left p-3">Title</th><th className="text-left p-3">Seller</th><th className="text-left p-3">Category</th><th className="text-left p-3">Status</th><th className="text-left p-3">Price</th><th className="text-right p-3">Actions</th></tr></thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{l.images[0] ? <img src={l.images[0].imageUrl} alt={l.title} className="h-10 w-10 object-cover rounded" /> : <div className="h-10 w-10 bg-gray-200 rounded" />}</td>
                <td className="p-3 font-medium">{l.title}</td>
                <td className="p-3">{l.seller.name}</td>
                <td className="p-3">{l.category.name}</td>
                <td className="p-3"><span className={`badge ${l.status === 'Active' ? 'badge-green' : l.status === 'Sold' ? 'badge-blue' : 'badge-gray'}`}>{l.status}</span></td>
                <td className="p-3">{'\u20B1'}{l.price.toLocaleString()}</td>
                <td className="p-3 text-right"><button onClick={() => setPendingRemove(l.id)} className="btn-ghost text-xs text-red-600">Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && (
          <EmptyState
            icon={<FiInbox className="w-10 h-10" />}
            title="No listings found"
            description={search || statusFilter !== 'ALL' ? 'Try adjusting your search or filters.' : 'Listings will appear here once created.'}
          />
        )}
      </div>

      <ConfirmDialog
        open={!!pendingRemove}
        title="Remove listing"
        message="Remove this listing from the marketplace? Buyers will no longer see it."
        confirmLabel="Remove"
        danger
        loading={removing}
        onConfirm={() => pendingRemove && handleRemove(pendingRemove)}
        onClose={() => setPendingRemove(null)}
      />
    </div>
  );
}
