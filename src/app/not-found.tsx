import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-4">Well… this page went missing.</h2>
        <p className="text-xl text-gray-600 mb-8">Probably sold already.</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Back to Marketplace
        </Link>
      </div>
    </div>
  );
}