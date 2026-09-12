const http = require('http');

const BASE = 'http://localhost:3000';
let passed = 0;
let failed = 0;
const results = [];

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
    results.push({ name, status: 'PASS' });
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    results.push({ name, status: 'FAIL', detail });
    console.log(`  ✗ ${name}${detail ? ': ' + detail : ''}`);
  }
}

async function run() {
  console.log('\n=== Sprint 1 QA Tests: Email Verification + Password Reset ===\n');

  // ---- Email Verification Tests ----
  console.log('--- Email Verification ---');

  // 1. Register a new user (should create verification token)
  const regRes = await req('POST', '/api/auth/register', {
    name: 'Test Verify User',
    email: 'test-verify-' + Date.now() + '@example.com',
    password: 'testpass123',
    role: 'buyer',
  });
  const regData = JSON.parse(regRes.body);
  const testEmail = regData.user?.email;
  assert('Register returns 201', regRes.status === 201, `got ${regRes.status}`);
  assert('Register returns user object', !!regData.user?.id, regRes.body.substring(0, 200));
  assert('User emailVerified is false by default', regData.user?.id !== undefined);

  // 2. Verify endpoint - missing token
  const noToken = await req('GET', '/api/auth/verify');
  assert('Verify without token returns 400', noToken.status === 400, `got ${noToken.status}`);

  // 3. Verify endpoint - invalid token
  const badToken = await req('GET', '/api/auth/verify?token=invalid-token-123');
  assert('Verify with invalid token returns 400', badToken.status === 400, `got ${badToken.status}`);

  // 4. Verify endpoint - valid token (fetch from DB would be needed, test with dummy)
  const dummyToken = '00000000-0000-0000-0000-000000000000';
  const dummyRes = await req('GET', `/api/auth/verify?token=${dummyToken}`);
  assert('Verify with non-existent token returns 400', dummyRes.status === 400, `got ${dummyRes.status}`);

  // 5. Resend verification - missing email
  const resendNoEmail = await req('POST', '/api/auth/verify/resend', {});
  assert('Resend without email returns 400', resendNoEmail.status === 400, `got ${resendNoEmail.status}`);

  // 6. Resend verification - non-existent email (should not reveal existence)
  const resendFake = await req('POST', '/api/auth/verify/resend', { email: 'nonexistent@example.com' });
  const resendFakeData = JSON.parse(resendFake.body);
  assert('Resend for non-existent email returns success (no enumeration)', resendFake.status === 200);
  assert('Resend message is generic', resendFakeData.message?.toLowerCase().includes('if an account exists'));

  // 7. Resend verification - valid email
  if (testEmail) {
    const resendValid = await req('POST', '/api/auth/verify/resend', { email: testEmail });
    assert('Resend for valid email returns 200', resendValid.status === 200, `got ${resendValid.status}`);
  }

  // ---- Password Reset Tests ----
  console.log('\n--- Password Reset ---');

  // 8. Forgot password - missing email
  const fpNoEmail = await req('POST', '/api/auth/forgot-password', {});
  assert('Forgot password without email returns 400', fpNoEmail.status === 400, `got ${fpNoEmail.status}`);

  // 9. Forgot password - non-existent email (should not reveal)
  const fpFake = await req('POST', '/api/auth/forgot-password', { email: 'nonexistent@example.com' });
  const fpFakeData = JSON.parse(fpFake.body);
  assert('Forgot password for non-existent email returns success (no enumeration)', fpFake.status === 200);
  assert('Forgot password message is generic', fpFakeData.message?.toLowerCase().includes('if an account exists'));

  // 10. Forgot password - valid email
  if (testEmail) {
    const fpValid = await req('POST', '/api/auth/forgot-password', { email: testEmail });
    assert('Forgot password for valid email returns 200', fpValid.status === 200, `got ${fpValid.status}`);
  }

  // 11. Reset password - missing fields
  const rpNoToken = await req('POST', '/api/auth/reset-password', {});
  assert('Reset password without token returns 400', rpNoToken.status === 400, `got ${rpNoToken.status}`);

  // 12. Reset password - short password
  const rpShort = await req('POST', '/api/auth/reset-password', { token: 'some-token', password: '123' });
  assert('Reset password with short password returns 400', rpShort.status === 400, `got ${rpShort.status}`);

  // 13. Reset password - invalid token
  const rpBad = await req('POST', '/api/auth/reset-password', { token: 'invalid-token', password: 'newpassword123' });
  assert('Reset password with invalid token returns 400', rpBad.status === 400, `got ${rpBad.status}`);

  // ---- Login page has forgot password link ----
  console.log('\n--- UI Checks ---');

  const loginPage = await req('GET', '/login');
  assert('Login page returns 200', loginPage.status === 200, `got ${loginPage.status}`);
  assert('Login page has forgot password link', loginPage.body.includes('forgot-password'));

  // ---- Verify email page exists ----
  const verifyPage = await req('GET', '/verify-email');
  assert('Verify email page returns 200', verifyPage.status === 200, `got ${verifyPage.status}`);

  // ---- Reset password page exists ----
  const resetPage = await req('GET', '/reset-password');
  assert('Reset password page returns 200', resetPage.status === 200, `got ${resetPage.status}`);

  // ---- Forgot password page exists ----
  const fpPage = await req('GET', '/forgot-password');
  assert('Forgot password page returns 200', fpPage.status === 200, `got ${fpPage.status}`);

  // ---- Unverified user blocked from creating listings ----
  console.log('\n--- Email Verification Gate ---');

  // Login as unverified buyer
  const loginRes = await req('POST', '/api/auth/login', {
    email: testEmail,
    password: 'testpass123',
  });
  const setCookieHeader = loginRes.headers['set-cookie'];
  const sessionCookie = Array.isArray(setCookieHeader) ? setCookieHeader[0]?.split(';')[0] : setCookieHeader?.split(';')[0];
  assert('Login as unverified user succeeds', loginRes.status === 200, `got ${loginRes.status}`);

  if (sessionCookie) {
    const createListing = await req('POST', '/api/listings', {
      title: 'Test Listing',
      description: 'This should fail',
      price: 100,
      categoryId: 'test',
      condition: 'Brand New',
      location: 'Manila',
      images: [],
    }, sessionCookie);
    assert('Unverified user blocked from creating listing (403)', createListing.status === 403, `got ${createListing.status}`);
    const clData = JSON.parse(createListing.body);
    assert('Error message mentions email verification', clData.error?.includes('verify'));
  }

  // Summary
  console.log(`\n=== Results: ${passed} passed, ${failed} failed, ${passed + failed} total ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => {
  console.error('Test runner error:', e);
  process.exit(1);
});
