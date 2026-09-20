'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiSearch, FiShoppingBag } from 'react-icons/fi';

export default function GoogleRegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'buyer' | 'seller' | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if the google_pending cookie exists (server will validate on submit)
    const hasCookie = document.cookie.includes('google_pending');
    if (!hasCookie) {
      router.push('/register?error=no_google_session');
      return;
    }
    setLoading(false);
  }, [router]);

  const handleRoleSelect = async (selectedRole: 'buyer' | 'seller') => {
    setRole(selectedRole);
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/auth/google/complete-registration', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setSubmitting(false);
        return;
      }

      // Success — redirect based on role
      if (data.isAdmin) {
        router.push('/admin');
      } else if (selectedRole === 'seller') {
        router.push('/seller/dashboard');
      } else {
        router.push('/buyer/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F3D91]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Almost there!</h1>
          <p className="text-gray-500 mt-2">Choose how you want to use BAI &amp; SIL</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect('buyer')}
            disabled={submitting}
            className={`w-full p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
              role === 'buyer'
                ? 'border-[#0F3D91] bg-[#EAF0FB]'
                : 'border-gray-200 bg-white hover:border-[#0F3D91]/30 hover:shadow-md'
            } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0F3D91]/10 flex items-center justify-center">
                <FiSearch className="w-6 h-6 text-[#0F3D91]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">I want to buy</h3>
                <p className="text-sm text-gray-500">Browse and find great deals</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect('seller')}
            disabled={submitting}
            className={`w-full p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
              role === 'seller'
                ? 'border-[#FFC72C] bg-[#FFC72C]/10'
                : 'border-gray-200 bg-white hover:border-[#FFC72C]/50 hover:shadow-md'
            } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFC72C]/20 flex items-center justify-center">
                <FiShoppingBag className="w-6 h-6 text-[#E6A800]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">I want to sell</h3>
                <p className="text-sm text-gray-500">List your items and earn</p>
              </div>
            </div>
          </button>
        </div>

        {submitting && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Setting up your account...
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
