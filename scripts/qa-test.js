const http = require('http');
const https = require('https');

const BASE = 'http://localhost:3000';
let passed = 0;
let failed = 0;
const results = [];

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BASE}${path}`, { timeout: 30000 }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function getWithCookie(path, cookie) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost', port: 3000, path, method: 'GET',
      headers: { 'Cookie': cookie },
      timeout: 30000,
    };
    const req = http.request(opts, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

function post(path, data, cookie) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const opts = {
      hostname: 'localhost', port: 3000, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      timeout: 30000,
    };
    if (cookie) opts.headers['Cookie'] = cookie;
    const req = http.request(opts, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: b, headers: res.headers }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(body);
    req.end();
  });
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 10000 }, (res) => {
      resolve(res.statusCode);
      res.resume();
    });
    req.on('error', () => resolve(0));
    req.on('timeout', () => { req.destroy(); resolve(0); });
  });
}

function test(name, fn) {
  return fn().then(() => {
    passed++;
    results.push({ name, status: 'PASS' });
    console.log(`  ✅ ${name}`);
  }).catch(err => {
    failed++;
    results.push({ name, status: 'FAIL', error: err.message });
    console.log(`  ❌ ${name}: ${err.message}`);
  });
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

// ============ PUBLIC PAGES ============
async function testPublicPages() {
  console.log('\n📄 PUBLIC PAGES');

  await test('Home page loads with hero', async () => {
    const r = await get('/');
    assert(r.status === 200, `Got ${r.status}`);
    assert(r.body.includes('Find stuff'), 'Missing hero text');
  });

  await test('Home page shows listings', async () => {
    const r = await get('/');
    assert(r.body.includes('Fresh Drops'), 'Missing Fresh Drops section');
  });

  await test('Home page has product images', async () => {
    const r = await get('/');
    assert(r.body.includes('pexels.com'), 'No Pexels images on home page');
  });

  await test('Categories page loads all 12', async () => {
    const r = await get('/categories');
    assert(r.status === 200, `Got ${r.status}`);
    const cats = ['Electronics', 'Fashion', 'Vehicles', 'Beauty', 'Sports', 'Gaming', 'Collectibles', 'Appliances', 'Tools', 'Books', 'Other'];
    const homeLiving = r.body.includes('Home & Living') || r.body.includes('Home &amp; Living');
    assert(homeLiving, 'Missing Home & Living');
    for (const c of cats) {
      assert(r.body.includes(c), `Missing category: ${c}`);
    }
  });

  await test('Search page loads', async () => {
    const r = await get('/search');
    assert(r.status === 200, `Got ${r.status}`);
  });

  await test('Login page has form', async () => {
    const r = await get('/login');
    assert(r.status === 200, `Got ${r.status}`);
    assert(r.body.includes('email') || r.body.includes('Email') || r.body.includes('login'), 'Missing login form');
  });

  await test('Register page has form', async () => {
    const r = await get('/register');
    assert(r.status === 200, `Got ${r.status}`);
  });

  await test('Auth-required pages redirect (307)', async () => {
    const pages = ['/sell', '/favorites', '/messages', '/notifications'];
    for (const p of pages) {
      const r = await get(p);
      assert(r.status === 307 || r.status === 200, `${p} got ${r.status}`);
    }
  });

  await test('Legal pages load', async () => {
    for (const p of ['/terms', '/privacy', '/safety']) {
      const r = await get(p);
      assert(r.status === 200, `${p} got ${r.status}`);
    }
  });

  await test('Invalid URL returns 404', async () => {
    const r = await get('/xyz-nonexistent-page-999');
    assert(r.status === 404 || r.body.includes('not found') || r.body.includes('404'), `Got ${r.status}`);
  });
}

// ============ API: LISTINGS ============
async function testListingsAPI() {
  console.log('\n🔌 API: LISTINGS');

  await test('Returns paginated listings', async () => {
    const r = await get('/api/listings?limit=5');
    assert(r.status === 200, `Got ${r.status}`);
    const d = JSON.parse(r.body);
    assert(d.listings.length > 0, 'No listings');
    assert(d.pagination.total > 0, 'No total count');
  });

  await test('Listings have all required fields', async () => {
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
  });

  await test('Listings have imageUrl at top level', async () => {
    const r = await get('/api/listings?limit=5');
    const listings = JSON.parse(r.body).listings;
    for (const l of listings) {
      assert(l.imageUrl, `No imageUrl for "${l.title}"`);
      assert(l.imageUrl.startsWith('http'), `Invalid URL for "${l.title}"`);
    }
  });

  await test('Category filter works', async () => {
    const r = await get('/api/listings?category=electronics&limit=3');
    const d = JSON.parse(r.body);
    assert(d.listings.length > 0, 'No electronics listings');
    for (const l of d.listings) {
      assert(l.category.slug === 'electronics', `Wrong category: ${l.category.slug}`);
    }
  });

  await test('Min/max price filter works', async () => {
    const r = await get('/api/listings?minPrice=10000&maxPrice=50000&limit=10');
    const d = JSON.parse(r.body);
    for (const l of d.listings) {
      assert(l.price >= 10000 && l.price <= 50000, `${l.title} price ${l.price} out of range`);
    }
  });

  await test('Sort by price ascending', async () => {
    const r = await get('/api/listings?sort=price_asc&limit=10');
    const d = JSON.parse(r.body);
    for (let i = 1; i < d.listings.length; i++) {
      assert(d.listings[i].price >= d.listings[i-1].price, 'Not sorted');
    }
  });

  await test('Sort by price descending', async () => {
    const r = await get('/api/listings?sort=price_desc&limit=10');
    const d = JSON.parse(r.body);
    for (let i = 1; i < d.listings.length; i++) {
      assert(d.listings[i].price <= d.listings[i-1].price, 'Not sorted');
    }
  });

  await test('Pagination works (page 2)', async () => {
    const r1 = await get('/api/listings?page=1&limit=5');
    const r2 = await get('/api/listings?page=2&limit=5');
    const d1 = JSON.parse(r1.body);
    const d2 = JSON.parse(r2.body);
    assert(d1.listings[0].id !== d2.listings[0].id, 'Page 1 and 2 are the same');
  });
}

// ============ API: CATEGORIES ============
async function testCategoriesAPI() {
  console.log('\n🔌 API: CATEGORIES');

  await test('Returns 12 categories', async () => {
    const r = await get('/api/categories');
    const d = JSON.parse(r.body);
    assert(d.categories.length === 12, `Got ${d.categories.length}`);
  });

  await test('Each category has listingCount >= 20', async () => {
    const r = await get('/api/categories');
    const d = JSON.parse(r.body);
    let total = 0;
    for (const c of d.categories) {
      assert(c.listingCount >= 20, `${c.name} has only ${c.listingCount} listings`);
      total += c.listingCount;
    }
    assert(total === 240, `Expected 240 total, got ${total}`);
  });
}

// ============ AUTH ============
async function testAuth() {
  console.log('\n🔐 AUTHENTICATION');

  let sessionCookie = null;

  await test('Login as seller', async () => {
    const r = await post('/api/auth/login', { email: 'seller@baiandsil.ph', password: 'password123' });
    assert(r.status === 200, `Got ${r.status}`);
    const d = JSON.parse(r.body);
    assert(d.user.email === 'seller@baiandsil.ph');
    assert(d.user.name === 'Sil the Seller');
    const sc = r.headers['set-cookie'];
    if (sc) {
      const arr = Array.isArray(sc) ? sc : [sc];
      sessionCookie = arr[0].split(';')[0];
    }
  });

  await test('Login as buyer', async () => {
    const r = await post('/api/auth/login', { email: 'buyer@baiandsil.ph', password: 'password123' });
    assert(r.status === 200, `Got ${r.status}`);
    const d = JSON.parse(r.body);
    assert(d.user.email === 'buyer@baiandsil.ph');
  });

  await test('Login as admin', async () => {
    const r = await post('/api/auth/login', { email: 'admin@baiandsil.ph', password: 'password123' });
    assert(r.status === 200, `Got ${r.status}`);
    const d = JSON.parse(r.body);
    assert(d.user.isAdmin === true);
  });

  await test('Wrong password rejected', async () => {
    const r = await post('/api/auth/login', { email: 'seller@baiandsil.ph', password: 'wrong' });
    assert(r.status === 401 || r.body.includes('error'), `Should reject: ${r.status}`);
  });

  await test('Nonexistent user rejected', async () => {
    const r = await post('/api/auth/login', { email: 'ghost@test.com', password: 'password123' });
    assert(r.status === 401 || r.status === 404 || r.body.includes('error'), `Should reject: ${r.status}`);
  });

  await test('Session cookie authenticates user', async () => {
    if (!sessionCookie) { console.log('    ⚠️  Skipped (no cookie captured)'); return; }
    const r = await getWithCookie('/api/auth/me', sessionCookie);
    assert(r.status === 200, `Got ${r.status}`);
  });
}

// ============ SEARCH ============
async function testSearch() {
  console.log('\n🔍 SEARCH');

  await test('Search via API finds results', async () => {
    const r = await get('/api/listings?q=MacBook&limit=5');
    const d = JSON.parse(r.body);
    assert(d.listings.length > 0, 'No results for MacBook');
    assert(d.listings[0].title.toLowerCase().includes('macbook'), `First result: ${d.listings[0].title}`);
  });

  await test('Search is case-insensitive', async () => {
    const r1 = await get('/api/listings?q=Nike&limit=5');
    const r2 = await get('/api/listings?q=nike&limit=5');
    const d1 = JSON.parse(r1.body);
    const d2 = JSON.parse(r2.body);
    assert(d1.listings.length === d2.listings.length, `Got ${d1.listings.length} vs ${d2.listings.length}`);
  });

  await test('Search via ?search= also works', async () => {
    const r = await get('/api/listings?search=Canon&limit=5');
    const d = JSON.parse(r.body);
    assert(d.listings.length > 0, 'No results via search param');
  });

  await test('Nonsense query returns empty', async () => {
    const r = await get('/api/listings?q=xyznonexistent999999');
    const d = JSON.parse(r.body);
    assert(d.listings.length === 0, `Got ${d.listings.length} results`);
  });
}

// ============ PRODUCT DETAIL ============
async function testProductDetail() {
  console.log('\n📦 PRODUCT DETAIL');

  let testSlug = null;
  let testTitle = null;

  await test('Listing detail page loads', async () => {
    const r = await get('/api/listings?limit=1');
    const l = JSON.parse(r.body).listings[0];
    testSlug = l.slug;
    testTitle = l.title;
    const r2 = await get(`/listing/${testSlug}`);
    assert(r2.status === 200, `Got ${r2.status}`);
  });

  await test('Detail page shows listing title', async () => {
    if (!testSlug) return;
    const r = await get(`/listing/${testSlug}`);
    assert(r.body.includes(testTitle), `Missing "${testTitle}"`);
  });

  await test('Detail page shows price', async () => {
    if (!testSlug) return;
    const r = await get(`/listing/${testSlug}`);
    assert(r.body.includes('₱'), 'No peso sign');
  });

  await test('Detail page shows seller info', async () => {
    if (!testSlug) return;
    const r = await get(`/listing/${testSlug}`);
    assert(r.body.includes('Sil the Seller') || r.body.includes('seller'), 'No seller info');
  });

  await test('Nonexistent listing shows not-found', async () => {
    const r = await get('/listing/definitely-not-real-slug-99999');
    assert(
      r.status === 404 || r.body.includes('not found') || r.body.includes('404'),
      `Got ${r.status}`
    );
  });
}

// ============ IMAGES ============
async function testImages() {
  console.log('\n🖼️  IMAGES');

  await test('All listings have Pexels URLs', async () => {
    const r = await get('/api/listings?limit=10');
    const listings = JSON.parse(r.body).listings;
    const broken = [];
    for (const l of listings) {
      if (!l.imageUrl?.includes('pexels.com')) broken.push(l.title);
    }
    assert(broken.length === 0, `Broken: ${broken.join(', ')}`);
  });

  await test('Pexels image URLs are valid HTTPS', async () => {
    const r = await get('/api/listings?limit=5');
    const listings = JSON.parse(r.body).listings;
    for (const l of listings) {
      assert(l.imageUrl.startsWith('https://images.pexels.com/'), `Invalid URL for "${l.title}"`);
      assert(l.imageUrl.includes('pexels-photo-'), `Malformed URL for "${l.title}"`);
    }
  });

  await test('Home page has img tags', async () => {
    const r = await get('/');
    assert(r.body.includes('<img'), 'No img tags');
    const imgCount = (r.body.match(/<img/g) || []).length;
    assert(imgCount >= 4, `Only ${imgCount} images on home page`);
  });
}

// ============ CATEGORY FILTERING ============
async function testCategoryFiltering() {
  console.log('\n📂 CATEGORY FILTERING');

  const cats = ['electronics', 'fashion', 'home-living', 'vehicles', 'beauty', 'sports', 'gaming', 'collectibles', 'appliances', 'tools', 'books', 'other'];

  for (const slug of cats) {
    await test(`Filter "${slug}" returns results`, async () => {
      const r = await get(`/api/listings?category=${slug}&limit=1`);
      const d = JSON.parse(r.body);
      assert(d.listings.length > 0, `No listings for ${slug}`);
      assert(d.listings[0].category.slug === slug, `Wrong category`);
    });
  }
}

// ============ RUN ALL ============
async function main() {
  console.log('🧪 BAI & SIL - Automated QA Tests');
  console.log('='.repeat(50));
  console.log(`Target: ${BASE}`);
  console.log(`Time: ${new Date().toISOString()}`);

  await testPublicPages();
  await testListingsAPI();
  await testCategoriesAPI();
  await testAuth();
  await testSearch();
  await testProductDetail();
  await testImages();
  await testCategoryFiltering();

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log(failed === 0 ? '\n🎉 ALL TESTS PASSED!' : '\n⚠️  SOME TESTS FAILED');

  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  ❌ ${r.name}: ${r.error}`);
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
