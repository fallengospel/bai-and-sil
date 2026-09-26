'use client';

import { useState } from 'react';
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiShoppingBag } from 'react-icons/fi';

interface GoogleRegisterClientProps {
  name: string | null;
  email: string;
  avatar: string | null;
}

export default function GoogleRegisterClient({ name, email, avatar }: GoogleRegisterClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = async (selectedRole: 'buyer' | 'seller') => {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Google icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-7 h-7">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to BAI &amp; SIL</h1>
          <p className="text-gray-500 mt-2">One last step — what do you want to do?</p>
        </div>

        {/* Google profile */}
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-2xl flex items-center gap-3">
          {avatar ? (
            <Image
              src={avatar}
              alt=""
              width={44}
              height={44}
              unoptimized
              className="w-11 h-11 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-bai-blue/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-bai-blue">
              {(name || email).charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{name || 'Google User'}</p>
            <p className="text-sm text-gray-500 truncate">{email}</p>
          </div>
          <span className="ml-auto text-xs font-medium text-gray-400 flex-shrink-0">via Google</span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleRoleSelect('buyer')}
            disabled={submitting}
            className="w-full p-5 rounded-2xl border-2 border-gray-200 bg-white text-left transition-all duration-200 hover:border-bai-blue/30 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-bai-blue/10 flex items-center justify-center flex-shrink-0">
                <FiSearch className="w-6 h-6 text-bai-blue" />
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
            className="w-full p-5 rounded-2xl border-2 border-gray-200 bg-white text-left transition-all duration-200 hover:border-[#FFC72C]/50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFC72C]/20 flex items-center justify-center flex-shrink-0">
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
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <LoadingSpinner size="sm" inline />
            Setting up your account...
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">
            Use a different account
          </Link>
        </div>
      </div>
    </div>
  );
}
