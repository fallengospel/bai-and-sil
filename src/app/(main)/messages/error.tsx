'use client';

import Link from 'next/link';

export default function MessagesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold text-gray-900 mb-3">Messages unavailable</h1>
        <p className="text-gray-600 mb-6">
          We couldn&apos;t load your conversations. Please try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-bai-blue text-white text-sm font-bold rounded-2xl hover:bg-bai-blue-hover transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-bold rounded-2xl hover:bg-gray-50 transition-colors"
          >
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
