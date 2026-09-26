'use client';

import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold text-gray-900 mb-3">Admin error</h1>
        <p className="text-gray-600 mb-6">
          Something went wrong loading the admin panel. The error has been logged.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-bai-blue text-white text-sm font-bold rounded-2xl hover:bg-bai-blue-hover transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/admin"
            className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-bold rounded-2xl hover:bg-gray-50 transition-colors"
          >
            Back to Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
