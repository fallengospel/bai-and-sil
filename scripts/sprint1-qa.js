const http = require('http');

const BASE = 'http://localhost:3000';
let passed = 0;
let failed = 0;

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
    console.log('  BUG:  ' + name + (detail ? ' -- ' + detail : ''));
  }
}

async function run() {
  console.log('\n=== Sprint 1 QA: Email Verification (OTP) + Password Reset ===\n');

  // ---- Email Verification (OTP) ----
  console.log('--- Email Verification (OTP) ---');

  const ts = Date.now();
  const testEmail = 'test-verify-' + ts + '@example.com';

  // Register
  const regRes = await req('POST', '/api/auth/register', {
    name: 'Test OTP User', email: testEmail, password: 'testpass123', role: 'buyer',
  });
  const regData = JSON.parse(regRes.body);
  assert('Register returns 201', regRes.status === 201, `got ${regRes.status}`);
  assert('Register returns user object', !!regData.user?.id);
  assert('Register returns requiresVerification=true', regData.requiresVerification === true);

  // Verify - missing fields
  const vNoFields = await req('POST', '/api/auth/verify', {});
  assert('Verify without fields returns 400', vNoFields.status === 400);

  // Verify - missing code
  const vNoCode = await req('POST', '/api/auth/verify', { email: testEmail });
  assert('Verify without code returns 400', vNoCode.status === 400);

  // Verify - invalid code
  const vBad = await req('POST', '/api/auth/verify', { email: testEmail, code: '000000' });
  assert('Verify with wrong code returns 400', vBad.status === 400);

  // Verify - non-existent email
  const vFake = await req('POST', '/api/auth/verify', { email: 'noone@test.com', code: '123456' });
  assert('Verify with fake email returns 400', vFake.status === 400);

  // Resend - missing email
  const rsNoEmail = await req('POST', '/api/auth/verify/resend', {});
  assert('Resend without email returns 400', rsNoEmail.status === 400);

  // Resend - non-existent email (no enumeration)
  const rsFake = await req('POST', '/api/auth/verify/resend', { email: 'fake@test.com' });
  const rsFakeData = JSON.parse(rsFake.body);
  assert('Resend for fake email returns success (no enumeration)', rsFake.status === 200);
  assert('Resend message is generic', rsFakeData.message?.toLowerCase().includes('if an account exists'));

  // Resend - valid email
  const rsValid = await req('POST', '/api/auth/verify/resend', { email: testEmail });
  assert('Resend for valid email returns 200', rsValid.status === 200);

  // ---- Password Reset ----
  console.log('\n--- Password Reset ---');

  const fpNoEmail = await req('POST', '/api/auth/forgot-password', {});
  assert('Forgot password without email returns 400', fpNoEmail.status === 400);

  const fpFake = await req('POST', '/api/auth/forgot-password', { email: 'fake@test.com' });
  assert('Forgot password fake email returns success (no enumeration)', fpFake.status === 200);

  const fpValid = await req('POST', '/api/auth/forgot-password', { email: testEmail });
  assert('Forgot password valid email returns 200', fpValid.status === 200);

  const rpNoFields = await req('POST', '/api/auth/reset-password', {});
  assert('Reset without fields returns 400', rpNoFields.status === 400);

  const rpShort = await req('POST', '/api/auth/reset-password', { token: 'x', password: '12' });
  assert('Reset with short password returns 400', rpShort.status === 400);

  const rpBad = await req('POST', '/api/auth/reset-password', { token: 'bad', password: 'newpass123' });
  assert('Reset with bad token returns 400', rpBad.status === 400);

  // ---- UI Pages ----
  console.log('\n--- UI Pages ---');

  const loginPage = await req('GET', '/login');
  assert('Login page loads', loginPage.status === 200);
  assert('Login page has forgot-password link', loginPage.body.includes('forgot-password'));

  const verifyPage = await req('GET', '/verify-email');
  assert('Verify email page loads', verifyPage.status === 200);

  const resetPage = await req('GET', '/reset-password');
  assert('Reset password page loads', resetPage.status === 200);

  const fpPage = await req('GET', '/forgot-password');
  assert('Forgot password page loads', fpPage.status === 200);

  // ---- Verification Gate ----
  console.log('\n--- Verification Gate ---');

  const loginRes = await req('POST', '/api/auth/login', { email: testEmail, password: 'testpass123' });
  assert('Unverified user can login', loginRes.status === 200);

  const sc = loginRes.headers['set-cookie'];
  const cookie = (Array.isArray(sc) ? sc[0] : sc)?.split(';')[0];

  if (cookie) {
    const createListing = await req('POST', '/api/listings', {
      title: 'Test', description: 'Should fail', price: 100,
      categoryId: 'x', condition: 'Brand New', location: 'Manila', images: [],
    }, cookie);
    assert('Unverified user blocked from listing (403)', createListing.status === 403, `got ${createListing.status}`);
  }

  // ---- Register as seller too ----
  console.log('\n--- Seller Registration ---');

  const sellerReg = await req('POST', '/api/auth/register', {
    name: 'Test Seller OTP', email: 'seller-otp-' + ts + '@example.com',
    password: 'testpass123', role: 'seller',
  });
  assert('Seller register returns 201', sellerReg.status === 201);
  assert('Seller also gets requiresVerification=true', JSON.parse(sellerReg.body).requiresVerification === true);

  // Summary
  console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed, ' + (passed + failed) + ' total ===\n');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error('Test error:', e); process.exit(1); });
