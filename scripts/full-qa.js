const http = require('http');

const BASE = 'http://localhost:3000';
let passed = 0;
let failed = 0;
const bugs = [];

function req(method, path, data, cookie) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    const opts = {
      hostname: 'localhost', port: 3000, path, method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    };
    if (body) opts.headers['Content-Length'] = Buffer.byteLength(body);
    if (cookie) opts.headers['Cookie'] = cookie;
    const handler = (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: b, headers: res.headers }));
    };
    const r = http.request(opts, handler);
    r.on('error', reject);
    r.on('timeout', () => { r.destroy(); reject(new Error('timeout')); });
    if (body) r.write(body);
    r.end();
  });
}

function assert(name, condition, detail) {
  if (condition) {
    passed++;
    console.log('  PASS: ' + name);
  } else {
    failed++;
    bugs.push({ name, detail });
    console.log('  BUG:  ' + name + (detail ? ' -- ' + detail : ''));
  }
}

function getCookie(headers) {
  const sc = headers['set-cookie'];
  if (!sc) return null;
  return (Array.isArray(sc) ? sc[0] : sc).split(';')[0];
}

async function run() {
  console.log('\n=== BAI & SIL Full Application QA ===\n');

  // 1. AUTH
  console.log('--- 1. AUTHENTICATION ---');
  const ts = Date.now();
  const sellerEmail = 'seller-' + ts + '@test.com';
  const buyerEmail = 'buyer-' + ts + '@test.com';

  const regSeller = await req('POST', '/api/auth/register', { name: 'Test Seller', email: sellerEmail, password: 'testpass123', role: 'seller' });
  assert('Register seller 201', regSeller.status === 201);

  const regBuyer = await req('POST', '/api/auth/register', { name: 'Test Buyer', email: buyerEmail, password: 'testpass123', role: 'buyer' });
  assert('Register buyer 201', regBuyer.status === 201);

  const loginSeller = await req('POST', '/api/auth/login', { email: sellerEmail, password: 'testpass123' });
  assert('Seller login 200', loginSeller.status === 200);
  const sellerCookie = getCookie(loginSeller.headers);

  const loginBuyer = await req('POST', '/api/auth/login', { email: buyerEmail, password: 'testpass123' });
  assert('Buyer login 200', loginBuyer.status === 200);
  const buyerCookie = getCookie(loginBuyer.headers);

  const loginAdmin = await req('POST', '/api/auth/login', { email: 'admin@baiandsil.ph', password: 'password123' });
  assert('Admin login 200', loginAdmin.status === 200);
  const adminCookie = getCookie(loginAdmin.headers);

  const loginSeedSeller = await req('POST', '/api/auth/login', { email: 'seller@baiandsil.ph', password: 'password123' });
  assert('Seed seller login 200', loginSeedSeller.status === 200);
  const seedSellerCookie = getCookie(loginSeedSeller.headers);

  const loginSeedBuyer = await req('POST', '/api/auth/login', { email: 'buyer@baiandsil.ph', password: 'password123' });
  assert('Seed buyer login 200', loginSeedBuyer.status === 200);
  const seedBuyerCookie = getCookie(loginSeedBuyer.headers);

  const me = await req('GET', '/api/auth/me', null, sellerCookie);
  assert('GET /api/auth/me returns user', me.status === 200 && JSON.parse(me.body).user?.email === sellerEmail);

  const meNoAuth = await req('GET', '/api/auth/me');
  assert('GET /api/auth/me no auth 401', meNoAuth.status === 401);

  const logout = await req('POST', '/api/auth/logout', null, sellerCookie);
  assert('Logout 200', logout.status === 200);

  // Re-login
  const reLogin = await req('POST', '/api/auth/login', { email: sellerEmail, password: 'testpass123' });
  const sellerCookie2 = getCookie(reLogin.headers);

  // 2. LISTINGS
  console.log('\n--- 2. LISTINGS ---');
  const listings = await req('GET', '/api/listings');
  const lData = JSON.parse(listings.body);
  assert('GET /api/listings 200', listings.status === 200);
  assert('Has pagination', !!lData.pagination);
  assert('Has listings array', Array.isArray(lData.listings));

  const fl = lData.listings[0];
  if (fl) {
    assert('Listing has id', !!fl.id);
    assert('Listing has title', !!fl.title);
    assert('Listing has price', typeof fl.price === 'number');
    assert('Listing has seller', !!fl.seller);
    assert('Listing has category', !!fl.category);
    assert('Listing has imageUrl', !!fl.imageUrl);

    const detail = await req('GET', '/api/listings/' + fl.id);
    const dData = JSON.parse(detail.body);
    assert('Detail returns 200', detail.status === 200);
    assert('Detail has seller', !!dData.listing?.seller);
    assert('Detail has images', Array.isArray(dData.listing?.images));
  }

  const catF = await req('GET', '/api/listings?category=electronics');
  assert('Category filter works', catF.status === 200 && JSON.parse(catF.body).listings?.length > 0);

  const priceF = await req('GET', '/api/listings?minPrice=100&maxPrice=500');
  assert('Price filter works', priceF.status === 200);

  const sortAsc = await req('GET', '/api/listings?sort=price_asc');
  const sData = JSON.parse(sortAsc.body);
  if (sData.listings?.length >= 2) {
    assert('Sort price_asc', sData.listings[0].price <= sData.listings[1].price);
  }

  const search = await req('GET', '/api/listings?q=phone');
  assert('Search works', search.status === 200);

  const page2 = await req('GET', '/api/listings?page=2');
  assert('Pagination works', page2.status === 200);

  // 3. CATEGORIES
  console.log('\n--- 3. CATEGORIES ---');
  const cats = await req('GET', '/api/categories');
  assert('12 categories', JSON.parse(cats.body).categories?.length === 12);

  // 4. FAVORITES
  console.log('\n--- 4. FAVORITES ---');
  if (fl && buyerCookie) {
    const bMe = JSON.parse((await req('GET', '/api/auth/me', null, buyerCookie)).body);
    const bId = bMe.user?.id;
    const oList = lData.listings.find(l => l.seller.id !== bId) || fl;

    const favOn = await req('POST', '/api/listings/' + oList.id + '/favorite', {}, buyerCookie);
    assert('Fav toggle on', favOn.status === 200 && JSON.parse(favOn.body).favorited === true);

    const favOff = await req('POST', '/api/listings/' + oList.id + '/favorite', {}, buyerCookie);
    assert('Fav toggle off', favOff.status === 200 && JSON.parse(favOff.body).favorited === false);

    await req('POST', '/api/listings/' + oList.id + '/favorite', {}, buyerCookie);
  }

  const favNoAuth = await req('POST', '/api/listings/' + (fl ? fl.id : 'x') + '/favorite');
  assert('Fav no auth 401', favNoAuth.status === 401);

  // 5. CONVERSATIONS & MESSAGES
  console.log('\n--- 5. CONVERSATIONS & MESSAGES ---');
  const sMe = JSON.parse((await req('GET', '/api/auth/me', null, seedSellerCookie)).body);
  const sId = sMe.user?.id;
  let convId = null;

  if (buyerCookie && sId && fl) {
    const cConv = await req('POST', '/api/conversations', { sellerId: sId, listingId: fl.id }, buyerCookie);
    assert('Create conversation', cConv.status === 201 || cConv.status === 200);
    convId = JSON.parse(cConv.body).conversation?.id;

    if (convId) {
      const gConv = await req('GET', '/api/conversations/' + convId, null, buyerCookie);
      assert('Get conversation 200', gConv.status === 200);

      const cList = await req('GET', '/api/conversations', null, buyerCookie);
      assert('List conversations 200', cList.status === 200);

      const sMsg = await req('POST', '/api/conversations/' + convId + '/messages', { message: 'Is this available?' }, buyerCookie);
      assert('Send message 201', sMsg.status === 201);

      const gMsg = await req('GET', '/api/conversations/' + convId + '/messages', null, buyerCookie);
      assert('Get messages 200', gMsg.status === 200);
      assert('Messages has items', JSON.parse(gMsg.body).messages?.length > 0);

      const sReply = await req('POST', '/api/conversations/' + convId + '/messages', { message: 'Yes!' }, seedSellerCookie);
      assert('Seller reply 201', sReply.status === 201);

      const wrongU = await req('GET', '/api/conversations/' + convId, null, adminCookie);
      assert('Wrong user 403', wrongU.status === 403);
    }
  }

  // 6. OFFERS
  console.log('\n--- 6. OFFERS ---');
  if (convId && buyerCookie && fl) {
    const cOffer = await req('POST', '/api/conversations/' + convId + '/offers', { amount: 500 }, buyerCookie);
    assert('Create offer 201', cOffer.status === 201);
    const oId = JSON.parse(cOffer.body).offer?.id;

    if (oId) {
      const gOffer = await req('GET', '/api/conversations/' + convId + '/offers', null, buyerCookie);
      assert('List offers 200', gOffer.status === 200);

      const sOffer = await req('POST', '/api/conversations/' + convId + '/offers', { amount: 400 }, seedSellerCookie);
      assert('Seller cant create offer 403', sOffer.status === 403);

      const accept = await req('PUT', '/api/listings/' + fl.id + '/offers/' + oId, { status: 'Accepted' }, seedSellerCookie);
      assert('Accept offer 200', accept.status === 200);

      const reAccept = await req('PUT', '/api/listings/' + fl.id + '/offers/' + oId, { status: 'Accepted' }, seedSellerCookie);
      assert('Re-accept blocked 400', reAccept.status === 400);
    }
  }

  // 7. NOTIFICATIONS
  console.log('\n--- 7. NOTIFICATIONS ---');
  if (buyerCookie) {
    const gN = await req('GET', '/api/notifications', null, buyerCookie);
    assert('Get notifications 200', gN.status === 200);
    assert('Notifications is array', Array.isArray(JSON.parse(gN.body).notifications));

    const nC = await req('GET', '/api/notifications/count', null, buyerCookie);
    assert('Notification count is number', typeof JSON.parse(nC.body).count === 'number');

    const mR = await req('PUT', '/api/notifications', null, buyerCookie);
    assert('Mark all read 200', mR.status === 200);

    const cAfter = JSON.parse((await req('GET', '/api/notifications/count', null, buyerCookie)).body);
    assert('Count 0 after mark read', cAfter.count === 0);
  }

  // 8. USER PROFILE
  console.log('\n--- 8. USER PROFILE ---');
  if (sId) {
    const gP = await req('GET', '/api/users/' + sId);
    assert('Get profile 200', gP.status === 200);
    const pD = JSON.parse(gP.body).user;
    assert('Profile has name', !!pD?.name);
    assert('Profile has role', !!pD?.role);

    if (seedSellerCookie) {
      const uP = await req('PUT', '/api/users/' + sId, { bio: 'QA test bio' }, seedSellerCookie);
      assert('Update own profile 200', uP.status === 200);
      const vU = JSON.parse((await req('GET', '/api/users/' + sId)).body);
      assert('Bio updated', vU.user?.bio === 'QA test bio');
    }

    if (buyerCookie) {
      const uO = await req('PUT', '/api/users/' + sId, { bio: 'Hacked!' }, buyerCookie);
      assert('Cant update other profile 403', uO.status === 403);
    }
  }

  // 9. REVIEWS
  console.log('\n--- 9. REVIEWS ---');
  if (sId) {
    const gR = await req('GET', '/api/users/' + sId + '/reviews');
    assert('Get reviews 200', gR.status === 200);
    assert('Reviews is array', Array.isArray(JSON.parse(gR.body).reviews));

    const gRA = await req('GET', '/api/reviews?userId=' + sId);
    assert('GET /api/reviews 200', gRA.status === 200);
  }

  // 10. SAVED SEARCHES
  console.log('\n--- 10. SAVED SEARCHES ---');
  if (buyerCookie) {
    const sS = await req('POST', '/api/searches', { name: 'QA Search ' + ts, query: 'phone', category: 'electronics' }, buyerCookie);
    assert('Create saved search', sS.status === 200 || sS.status === 201);
    const sId2 = JSON.parse(sS.body).search?.id;

    const lS = await req('GET', '/api/searches', null, buyerCookie);
    assert('List saved searches 200', lS.status === 200);

    if (sId2) {
      const dS = await req('DELETE', '/api/searches?id=' + sId2, null, buyerCookie);
      assert('Delete saved search 200', dS.status === 200);
    }
  }

  // 11. PRICE ALERTS
  console.log('\n--- 11. PRICE ALERTS ---');
  if (buyerCookie && fl) {
    const bMe2 = JSON.parse((await req('GET', '/api/auth/me', null, buyerCookie)).body);
    const alertList = lData.listings.find(l => l.seller.id !== bMe2.user?.id) || fl;

    const aOn = await req('POST', '/api/price-alerts', { listingId: alertList.id }, buyerCookie);
    assert('Subscribe price alert', aOn.status === 200 || aOn.status === 201);

    const gA = await req('GET', '/api/price-alerts', null, buyerCookie);
    assert('Get price alerts 200', gA.status === 200);

    const aOff = await req('POST', '/api/price-alerts', { listingId: alertList.id }, buyerCookie);
    assert('Unsubscribe price alert', aOff.status === 200);
  }

  // 12. ADMIN
  console.log('\n--- 12. ADMIN ---');
  if (adminCookie) {
    const aL = await req('GET', '/api/admin/listings', null, adminCookie);
    assert('Admin list listings 200', aL.status === 200);

    const aU = await req('GET', '/api/admin/users', null, adminCookie);
    assert('Admin list users 200', aU.status === 200);

    const aR = await req('GET', '/api/admin/reports', null, adminCookie);
    assert('Admin list reports 200', aR.status === 200);
  }

  if (buyerCookie) {
    const nA = await req('GET', '/api/admin/users', null, buyerCookie);
    assert('Non-admin blocked 403', nA.status === 403);
  }

  // 13. REPORTS
  console.log('\n--- 13. REPORTS ---');
  if (buyerCookie && fl) {
    const rep = await req('POST', '/api/listings/' + fl.id + '/report', { reason: 'Spam', description: 'QA test' }, buyerCookie);
    assert('Report listing', rep.status === 200 || rep.status === 201 || rep.status === 409);

    const dRep = await req('POST', '/api/listings/' + fl.id + '/report', { reason: 'Spam' }, buyerCookie);
    assert('Duplicate report blocked', dRep.status === 409);
  }

  // 14. LISTING STATUS
  console.log('\n--- 14. LISTING STATUS ---');
  if (fl && buyerCookie) {
    const bSt = await req('PUT', '/api/listings/' + fl.id + '/status', { status: 'Reserved' }, buyerCookie);
    assert('Non-owner cant update status 403', bSt.status === 403);
  }

  // 15. EDGE CASES
  console.log('\n--- 15. EDGE CASES ---');
  const nf = await req('GET', '/api/listings/00000000-0000-0000-0000-000000000000');
  assert('Nonexistent listing 404', nf.status === 404);

  const nfU = await req('GET', '/api/users/00000000-0000-0000-0000-000000000000');
  assert('Nonexistent user 404', nfU.status === 404);

  const badL = await req('POST', '/api/auth/login', { email: 'x@test.com', password: 'wrong' });
  assert('Wrong password 401', badL.status === 401);

  const eR = await req('POST', '/api/auth/register', {});
  assert('Empty register 400', eR.status === 400);

  const sP = await req('POST', '/api/auth/register', { name: 'T', email: 'x' + ts + '@t.com', password: '12' });
  assert('Short password 400', sP.status === 400);

  const dupE = await req('POST', '/api/auth/register', { name: 'Dup', email: sellerEmail, password: 'testpass123' });
  assert('Duplicate email 409', dupE.status === 409);

  // 16. OFFERS ME
  console.log('\n--- 16. OFFERS ME ---');
  if (buyerCookie) {
    const oM = await req('GET', '/api/users/me/offers', null, buyerCookie);
    assert('GET /api/users/me/offers 200', oM.status === 200);
    const oMD = JSON.parse(oM.body);
    assert('Has sent array', Array.isArray(oMD.sent));
    assert('Has received array', Array.isArray(oMD.received));
  }

  // 17. FAVORITES ME
  console.log('\n--- 17. FAVORITES ME ---');
  if (seedBuyerCookie) {
    const fM = await req('GET', '/api/users/me/favorites', null, seedBuyerCookie);
    assert('GET /api/users/me/favorites 200', fM.status === 200);
  }

  // SUMMARY
  console.log('\n=== RESULTS: ' + passed + ' passed, ' + failed + ' failed, ' + (passed + failed) + ' total ===\n');

  if (bugs.length > 0) {
    console.log('=== BUGS FOUND ===');
    bugs.forEach((b, i) => {
      console.log((i + 1) + '. ' + b.name + (b.detail ? ' -- ' + b.detail : ''));
    });
    console.log('');
  }

  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => {
  console.error('Test runner error:', e);
  process.exit(1);
});
