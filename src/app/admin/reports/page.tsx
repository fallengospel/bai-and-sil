'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Report {
  id: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
  reporter: { name: string };
  listing: { id: string; title: string };
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/admin/reports').then(r => r.json()).then(data => {
      if (!data.reports) { router.push('/'); return; }
      setReports(data.reports);
    }).catch(() => router.push('/')).finally(() => setLoading(false));
  }, [router]);

  const handleUpdateStatus = async (reportId: string, status: string) => {
    await fetch('/api/admin/reports', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reportId, status }),
    });
    setReports(reports.map(r => r.id === reportId ? { ...r, status } : r));
  };

  const handleRemoveListing = async (reportId: string, listingId: string) => {
    if (!confirm('Remove this listing?')) return;
    await fetch(`/api/admin/listings/${listingId}`, { method: 'DELETE' });
    await fetch('/api/admin/reports', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reportId, status: 'Reviewed' }),
    });
    setReports(reports.map(r => r.id === reportId ? { ...r, status: 'Reviewed' } : r));
  };

  const filtered = reports.filter(r => {
    const matchSearch = r.reason.toLowerCase().includes(search.toLowerCase()) || r.listing.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bai-blue" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Report Management</h1>
      <div className="flex gap-4">
        <input type="text" placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} className="input-field max-w-sm" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field max-w-[160px]">
          <option value="ALL">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Reviewed">Reviewed</option>
          <option value="Dismissed">Dismissed</option>
        </select>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="text-left p-3">Reporter</th><th className="text-left p-3">Listing</th><th className="text-left p-3">Reason</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th><th className="text-right p-3">Actions</th></tr></thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{r.reporter.name}</td>
                <td className="p-3 font-medium">{r.listing.title}</td>
                <td className="p-3">{r.reason}</td>
                <td className="p-3"><span className={`badge ${r.status === 'Pending' ? 'badge-yellow' : r.status === 'Reviewed' ? 'badge-green' : 'badge-gray'}`}>{r.status}</span></td>
                <td className="p-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-right space-x-2">
                  {r.status === 'Pending' && (
                    <>
                      <button onClick={() => handleUpdateStatus(r.id, 'Reviewed')} className="btn-ghost text-xs text-green-600">Mark Reviewed</button>
                      <button onClick={() => handleUpdateStatus(r.id, 'Dismissed')} className="btn-ghost text-xs">Dismiss</button>
                      <button onClick={() => handleRemoveListing(r.id, r.listing.id)} className="btn-ghost text-xs text-red-600">Remove Listing</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">No reports.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
