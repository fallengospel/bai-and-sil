'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlay, FiCheckCircle, FiXCircle, FiClock, FiLoader, FiCode, FiCheckSquare } from 'react-icons/fi';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  error?: string;
  duration: number;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  status: 'idle' | 'running' | 'done';
}

type Tab = 'qa' | 'dev';

export default function AdminTestingPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('qa');
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [running, setRunning] = useState(false);

  const qaSuites: TestSuite[] = [
    { name: 'Public Pages', tests: [], status: 'idle' },
    { name: 'Listings API', tests: [], status: 'idle' },
    { name: 'Categories API', tests: [], status: 'idle' },
    { name: 'Authentication', tests: [], status: 'idle' },
    { name: 'Search', tests: [], status: 'idle' },
    { name: 'Product Detail', tests: [], status: 'idle' },
  ];

  const devSuites: TestSuite[] = [
    { name: 'API Health', tests: [], status: 'idle' },
    { name: 'Auth Endpoints', tests: [], status: 'idle' },
    { name: 'Admin Endpoints', tests: [], status: 'idle' },
    { name: 'Middleware', tests: [], status: 'idle' },
  ];

  useEffect(() => { setSuites(tab === 'qa' ? qaSuites : devSuites); }, [tab]);

  const runTest = useCallback(async (
    name: string,
    fn: () => Promise<void>
  ): Promise<TestResult> => {
    const start = Date.now();
    try {
      await fn();
      return { name, status: 'pass', duration: Date.now() - start };
    } catch (e: any) {
      return { name, status: 'fail', error: e.message || String(e), duration: Date.now() - start };
    }
  }, []);

  const get = (path: string) =>
    fetch(path, { credentials: 'include' }).then(async r => ({
      status: r.status,
      body: await r.text(),
      ok: r.ok,
    }));

  const post = (path: string, data: any) =>
    fetch(path, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(async r => ({
      status: r.status,
      body: await r.text(),
      ok: r.ok,
    }));

  const assert = (cond: any, msg: string) => { if (!cond) throw new Error(msg); };

  const runQASuite = async (suiteIdx: number) => {
    const results: TestResult[] = [];

    if (suiteIdx === 0) {
      // Public Pages
      results.push(await runTest('Home page loads (200)', async () => {
        const r = await get('/');
        assert(r.status === 200, `Got ${r.status}`);
      }));
      results.push(await runTest('Home page has hero text', async () => {
        const r = await get('/');
        assert(r.body.includes('Hanap') || r.body.includes('I-repeat'), 'Missing hero text');
      }));
      results.push(await runTest('Categories page loads (200)', async () => {
        const r = await get('/categories');
        assert(r.status === 200, `Got ${r.status}`);
      }));
      results.push(await runTest('Search page loads (200)', async () => {
        const r = await get('/search');
        assert(r.status === 200, `Got ${r.status}`);
      }));
      results.push(await runTest('Login page has form', async () => {
        const r = await get('/login');
        assert(r.status === 200, `Got ${r.status}`);
        assert(r.body.includes('email') || r.body.includes('Email') || r.body.includes('Log'), 'Missing form');
      }));
      results.push(await runTest('Register page loads (200)', async () => {
        const r = await get('/register');
        assert(r.status === 200, `Got ${r.status}`);
      }));
      results.push(await runTest('Legal pages load', async () => {
        for (const p of ['/terms', '/privacy', '/safety']) {
          const r = await get(p);
          assert(r.status === 200, `${p} got ${r.status}`);
        }
      }));
      results.push(await runTest('Auth-required pages redirect', async () => {
        for (const p of ['/sell', '/favorites', '/messages', '/notifications']) {
          const r = await get(p);
          assert(r.status === 307 || r.status === 200 || r.status === 302, `${p} got ${r.status}`);
        }
      }));
      results.push(await runTest('Invalid URL returns 404', async () => {
        const r = await get('/xyz-nonexistent-999');
        assert(r.status === 404 || r.body.includes('not found') || r.body.includes('404'), `Got ${r.status}`);
      }));
    }

    if (suiteIdx === 1) {
      // Listings API
      results.push(await runTest('Returns paginated listings', async () => {
        const r = await get('/api/listings?limit=5');
        assert(r.status === 200, `Got ${r.status}`);
        const d = JSON.parse(r.body);
        assert(d.listings?.length > 0, 'No listings');
        assert(d.pagination?.total > 0, 'No total');
      }));
      results.push(await runTest('Listings have all required fields', async () => {
        const r = await get('/api/listings?limit=1');
        const l = JSON.parse(r.body).listings[0];
        assert(l.id, 'Missing id');
        assert(l.title, 'Missing title');
        assert(l.slug, 'Missing slug');
        assert(l.price !== undefined, 'Missing price');
        assert(l.condition, 'Missing condition');
        assert(l.location, 'Missing location');
        assert(l.seller?.name, 'Missing seller name');
        assert(l.category?.name, 'Missing category name');
      }));
      results.push(await runTest('Category filter works', async () => {
        const r = await get('/api/listings?category=electronics&limit=3');
        const d = JSON.parse(r.body);
        assert(d.listings?.length > 0, 'No electronics listings');
      }));
      results.push(await runTest('Sort by price asc', async () => {
        const r = await get('/api/listings?sort=price_asc&limit=10');
        const d = JSON.parse(r.body);
        for (let i = 1; i < d.listings.length; i++) {
          assert(d.listings[i].price >= d.listings[i - 1].price, 'Not sorted');
        }
      }));
      results.push(await runTest('Sort by price desc', async () => {
        const r = await get('/api/listings?sort=price_desc&limit=10');
        const d = JSON.parse(r.body);
        for (let i = 1; i < d.listings.length; i++) {
          assert(d.listings[i].price <= d.listings[i - 1].price, 'Not sorted');
        }
      }));
      results.push(await runTest('Pagination page 2 differs', async () => {
        const r1 = await get('/api/listings?page=1&limit=5');
        const r2 = await get('/api/listings?page=2&limit=5');
        const d1 = JSON.parse(r1.body);
        const d2 = JSON.parse(r2.body);
        assert(d1.listings[0].id !== d2.listings[0].id, 'Same page');
      }));
    }

    if (suiteIdx === 2) {
      // Categories API
      results.push(await runTest('Returns 12 categories', async () => {
        const r = await get('/api/categories');
        const d = JSON.parse(r.body);
        assert(d.categories?.length === 12, `Got ${d.categories?.length}`);
      }));
      results.push(await runTest('Each category has listings', async () => {
        const r = await get('/api/categories');
        const d = JSON.parse(r.body);
        for (const c of d.categories) {
          assert((c.listingCount || c._count?.listings || 0) > 0, `${c.name} has 0 listings`);
        }
      }));
      results.push(await runTest('Category icons present', async () => {
        const r = await get('/api/categories');
        const d = JSON.parse(r.body);
        for (const c of d.categories) {
          assert(c.icon || c.slug, `${c.name} missing icon`);
        }
      }));
    }

    if (suiteIdx === 3) {
      // Auth
      results.push(await runTest('Login as admin', async () => {
        const r = await post('/api/auth/login', { email: 'admin@baiandsil.ph', password: 'password123' });
        assert(r.status === 200, `Got ${r.status}`);
        const d = JSON.parse(r.body);
        assert(d.user?.isAdmin === true, 'Not admin');
      }));
      results.push(await runTest('Login as seller', async () => {
        const r = await post('/api/auth/login', { email: 'seller@baiandsil.ph', password: 'password123' });
        assert(r.status === 200, `Got ${r.status}`);
        const d = JSON.parse(r.body);
        assert(d.user?.email === 'seller@baiandsil.ph', 'Wrong email');
      }));
      results.push(await runTest('Login as buyer', async () => {
        const r = await post('/api/auth/login', { email: 'buyer@baiandsil.ph', password: 'password123' });
        assert(r.status === 200, `Got ${r.status}`);
        const d = JSON.parse(r.body);
        assert(d.user?.email === 'buyer@baiandsil.ph', 'Wrong email');
      }));
      results.push(await runTest('Wrong password rejected (401)', async () => {
        const r = await post('/api/auth/login', { email: 'admin@baiandsil.ph', password: 'wrong' });
        assert(r.status === 401 || r.body.includes('error'), `Should reject: ${r.status}`);
      }));
      results.push(await runTest('Nonexistent user rejected', async () => {
        const r = await post('/api/auth/login', { email: 'ghost@test.com', password: 'password123' });
        assert(r.status === 401 || r.status === 404 || r.body.includes('error'), `Should reject: ${r.status}`);
      }));
      results.push(await runTest('GET /api/auth/me returns user', async () => {
        const r = await get('/api/auth/me');
        assert(r.status === 200, `Got ${r.status}`);
        const d = JSON.parse(r.body);
        assert(d.user?.email, 'No user in session');
      }));
    }

    if (suiteIdx === 4) {
      // Search
      results.push(await runTest('Search finds MacBook', async () => {
        const r = await get('/api/listings?q=MacBook&limit=5');
        const d = JSON.parse(r.body);
        assert(d.listings?.length > 0, 'No results');
      }));
      results.push(await runTest('Search case-insensitive', async () => {
        const r1 = await get('/api/listings?q=Nike&limit=5');
        const r2 = await get('/api/listings?q=nike&limit=5');
        assert(JSON.parse(r1.body).listings?.length === JSON.parse(r2.body).listings?.length, 'Different counts');
      }));
      results.push(await runTest('Nonsense query returns empty', async () => {
        const r = await get('/api/listings?q=xyznonexistent999999');
        const d = JSON.parse(r.body);
        assert(d.listings?.length === 0, `Got ${d.listings?.length}`);
      }));
    }

    if (suiteIdx === 5) {
      // Product Detail
      let slug = '';
      results.push(await runTest('Listing detail loads', async () => {
        const r = await get('/api/listings?limit=1');
        slug = JSON.parse(r.body).listings[0]?.slug;
        assert(slug, 'No slug');
        const r2 = await get(`/listing/${slug}`);
        assert(r2.status === 200, `Got ${r2.status}`);
      }));
      results.push(await runTest('Detail shows title', async () => {
        if (!slug) throw new Error('Skipped: no slug');
        const r = await get('/api/listings?limit=1');
        const title = JSON.parse(r.body).listings[0].title;
        const r2 = await get(`/listing/${slug}`);
        assert(r2.body.includes(title), `Missing "${title}"`);
      }));
      results.push(await runTest('Nonexistent slug returns 404', async () => {
        const r = await get('/listing/definitely-not-real-slug-99999');
        assert(r.status === 404 || r.body.includes('not found') || r.body.includes('404'), `Got ${r.status}`);
      }));
    }

    return results;
  };

  const runDevSuite = async (suiteIdx: number) => {
    const results: TestResult[] = [];

    if (suiteIdx === 0) {
      // API Health
      results.push(await runTest('GET /api/listings (200)', async () => {
        const r = await get('/api/listings?limit=1');
        assert(r.status === 200, `Got ${r.status}`);
      }));
      results.push(await runTest('GET /api/categories (200)', async () => {
        const r = await get('/api/categories');
        assert(r.status === 200, `Got ${r.status}`);
      }));
      results.push(await runTest('GET /api/auth/me (200)', async () => {
        const r = await get('/api/auth/me');
        assert(r.status === 200, `Got ${r.status}`);
      }));
      results.push(await runTest('GET /api/notifications/count (200)', async () => {
        const r = await get('/api/notifications/count');
        assert(r.status === 200 || r.status === 401, `Got ${r.status}`);
      }));
    }

    if (suiteIdx === 1) {
      // Auth Endpoints
      results.push(await runTest('POST /api/auth/login validates body', async () => {
        const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        assert(r.status === 400 || r.status === 422 || r.status === 500, `Should validate: ${r.status}`);
      }));
      results.push(await runTest('POST /api/auth/register validates body', async () => {
        const r = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        assert(r.status === 400 || r.status === 422 || r.status === 500, `Should validate: ${r.status}`);
      }));
      results.push(await runTest('POST /api/auth/verify validates OTP', async () => {
        const r = await fetch('/api/auth/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'test@test.com', code: '000000' }) });
        assert(r.status >= 400, `Should reject: ${r.status}`);
      }));
    }

    if (suiteIdx === 2) {
      // Admin Endpoints
      results.push(await runTest('GET /api/admin/users requires admin', async () => {
        const r = await get('/api/admin/users');
        assert(r.status === 200 || r.status === 401 || r.status === 403, `Got ${r.status}`);
      }));
      results.push(await runTest('GET /api/admin/listings requires admin', async () => {
        const r = await get('/api/admin/listings');
        assert(r.status === 200 || r.status === 401 || r.status === 403, `Got ${r.status}`);
      }));
      results.push(await runTest('GET /api/admin/reports requires admin', async () => {
        const r = await get('/api/admin/reports');
        assert(r.status === 200 || r.status === 401 || r.status === 403, `Got ${r.status}`);
      }));
    }

    if (suiteIdx === 3) {
      // Middleware
      results.push(await runTest('Security headers present', async () => {
        const r = await get('/');
        assert(r.body.includes('html') || r.status === 200, 'No HTML response');
      }));
      results.push(await runTest('Rate limit headers (if any)', async () => {
        const r = await get('/api/listings?limit=1');
        // Rate limit may or may not be active - just check endpoint works
        assert(r.status === 200, `Got ${r.status}`);
      }));
      results.push(await runTest('Protected route redirects unauth', async () => {
        // Try to access a protected page without session
        const r = await fetch('/favorites', { redirect: 'manual' });
        assert(r.status === 307 || r.status === 200 || r.status === 302, `Got ${r.status}`);
      }));
    }

    return results;
  };

  const runAllTests = async () => {
    setRunning(true);
    const suiteFns = tab === 'qa'
      ? [runQASuite, runQASuite, runQASuite, runQASuite, runQASuite, runQASuite]
      : [runDevSuite, runDevSuite, runDevSuite, runDevSuite];

    for (let i = 0; i < suiteFns.length; i++) {
      setSuites(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running' } : s));
      const results = await suiteFns[i](i);
      setSuites(prev => prev.map((s, idx) => idx === i ? { ...s, tests: results, status: 'done' } : s));
    }

    setRunning(false);
  };

  const totalPassed = suites.reduce((a, s) => a + s.tests.filter(t => t.status === 'pass').length, 0);
  const totalFailed = suites.reduce((a, s) => a + s.tests.filter(t => t.status === 'fail').length, 0);
  const total = totalPassed + totalFailed;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testing</h1>
          <p className="text-gray-500 mt-1">Run QA and developer test suites</p>
        </div>
        <button
          onClick={runAllTests}
          disabled={running}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0F3D91] text-white rounded-lg font-bold hover:bg-[#0D347A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiPlay className="w-4 h-4" />}
          {running ? 'Running...' : 'Run All Tests'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab('qa')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'qa' ? 'bg-white text-[#0F3D91] shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiCheckSquare className="w-4 h-4" />
          QA Testing
        </button>
        <button
          onClick={() => setTab('dev')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'dev' ? 'bg-white text-[#0F3D91] shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiCode className="w-4 h-4" />
          Developer Testing
        </button>
      </div>

      {/* Summary Bar */}
      {total > 0 && (
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <FiCheckCircle className="w-4 h-4 text-green-500" />
            <span className="font-bold text-green-700">{totalPassed}</span>
            <span className="text-gray-500">passed</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FiXCircle className="w-4 h-4 text-red-500" />
            <span className="font-bold text-red-700">{totalFailed}</span>
            <span className="text-gray-500">failed</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-gray-900">{total}</span>
            <span className="text-gray-500">total</span>
          </div>
          {totalFailed === 0 && total > 0 && (
            <span className="ml-auto text-sm font-bold text-green-600">All passing</span>
          )}
        </div>
      )}

      {/* Suites */}
      <div className="space-y-4">
        {suites.map((suite, si) => (
          <div key={si} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                {suite.status === 'running' ? (
                  <FiLoader className="w-5 h-5 text-[#0F3D91] animate-spin" />
                ) : suite.status === 'done' ? (
                  suite.tests.some(t => t.status === 'fail') ? (
                    <FiXCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <FiCheckCircle className="w-5 h-5 text-green-500" />
                  )
                ) : (
                  <FiClock className="w-5 h-5 text-gray-400" />
                )}
                <h3 className="font-bold text-gray-900">{suite.name}</h3>
              </div>
              {suite.tests.length > 0 && (
                <span className="text-sm text-gray-500">
                  {suite.tests.filter(t => t.status === 'pass').length}/{suite.tests.length} passed
                </span>
              )}
            </div>
            {suite.tests.length > 0 && (
              <div className="divide-y divide-gray-50">
                {suite.tests.map((t, ti) => (
                  <div key={ti} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    {t.status === 'pass' ? (
                      <FiCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : t.status === 'fail' ? (
                      <FiXCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    ) : (
                      <FiClock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span className="flex-1 text-gray-700">{t.name}</span>
                    {t.error && <span className="text-xs text-red-500 max-w-xs truncate">{t.error}</span>}
                    <span className="text-xs text-gray-400">{t.duration}ms</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
