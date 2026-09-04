'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    fetch('/api/admin/listings').then(r => r.json()).then(data => {
      if (!data.listings) { router.push('/'); return; }
      setListings(data.listings);
    }).catch(() => router.push('/')).finally(() => setLoading(false));
  }, [router]);

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this listing?')) return;
    await fetch(`/api/admin/listings/${id}`, { method: 'DELETE' });
    setListings(listings.filter(l => l.id !== id));
  };

  const filtered = listings.filter(l => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bai-blue" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Listing Management</h1>
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
        <table className="w-full text-sm">
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
                <td className="p-3 text-right"><button onClick={() => handleRemove(l.id)} className="btn-ghost text-xs text-red-600">Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
