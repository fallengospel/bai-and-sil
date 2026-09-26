'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiFlag } from 'react-icons/fi';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';

interface Report {
  id: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
  reporter: { name: string };
  listing: { id: string; title: string } | null;
  reportedUser?: { id: string; name: string } | null;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pendingRemove, setPendingRemove] = useState<{ reportId: string; listingId: string } | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/reports').then(r => r.json()).then(data => {
      if (!data.reports) { router.push('/'); return; }
      setReports(data.reports);
    }).catch(() => router.push('/')).finally(() => setLoading(false));
  }, [router]);

  const handleUpdateStatus = async (reportId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reportId, status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || 'Failed to update report');
        return;
      }
      setReports(reports.map(r => r.id === reportId ? { ...r, status } : r));
      toast.success(`Report ${status.toLowerCase()}`);
    } catch {
      toast.error('Failed to update report');
    }
  };

  const confirmRemoveListing = async () => {
    if (!pendingRemove) return;
    setRemoving(true);
    try {
      const delRes = await fetch(`/api/admin/listings/${pendingRemove.listingId}`, { method: 'DELETE' });
      if (!delRes.ok) {
        const data = await delRes.json().catch(() => null);
        toast.error(data?.error || 'Failed to remove listing');
        return;
      }
      const res = await fetch('/api/admin/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pendingRemove.reportId, status: 'Reviewed' }),
      });
      if (!res.ok) {
        toast.error('Listing removed, but failed to update report status');
      } else {
        toast.success('Listing removed');
      }
      setReports(reports.map(r => r.id === pendingRemove.reportId ? { ...r, status: 'Reviewed' } : r));
      setPendingRemove(null);
    } catch {
      toast.error('Failed to remove listing');
    } finally {
      setRemoving(false);
    }
  };

  const filtered = reports.filter(r => {
    const target = r.listing?.title || r.reportedUser?.name || '';
    const matchSearch = r.reason.toLowerCase().includes(search.toLowerCase()) || target.toLowerCase().includes(search.toLowerCase());
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
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-gray-50"><tr><th className="text-left p-3">Reporter</th><th className="text-left p-3">Target</th><th className="text-left p-3">Reason</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th><th className="text-right p-3">Actions</th></tr></thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{r.reporter.name}</td>
                <td className="p-3 font-medium">{r.listing?.title || (r.reportedUser ? `${r.reportedUser.name} (user)` : '—')}</td>
                <td className="p-3">{r.reason}</td>
                <td className="p-3"><span className={`badge ${r.status === 'Pending' ? 'badge-yellow' : r.status === 'Reviewed' ? 'badge-green' : 'badge-gray'}`}>{r.status}</span></td>
                <td className="p-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-right space-x-2">
                  {r.status === 'Pending' && (
                    <>
                      <button onClick={() => handleUpdateStatus(r.id, 'Reviewed')} className="btn-ghost text-xs text-green-600">Mark Reviewed</button>
                      <button onClick={() => handleUpdateStatus(r.id, 'Dismissed')} className="btn-ghost text-xs">Dismiss</button>
                      {r.listing && (
                        <button onClick={() => setPendingRemove({ reportId: r.id, listingId: r.listing!.id })} className="btn-ghost text-xs text-red-600">Remove Listing</button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8">
                  <EmptyState
                    icon={<FiFlag className="w-10 h-10" />}
                    title="No reports found"
                    description={search || statusFilter !== 'ALL' ? 'Try adjusting your search or filters.' : 'User reports will appear here.'}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingRemove}
        title="Remove listing"
        message="Remove this listing from the marketplace and mark the report as reviewed?"
        confirmLabel="Remove"
        danger
        loading={removing}
        onConfirm={confirmRemoveListing}
        onClose={() => setPendingRemove(null)}
      />
    </div>
  );
}
