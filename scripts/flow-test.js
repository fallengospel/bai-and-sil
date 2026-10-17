/* Deep end-to-end flow test: full user journeys across auth, listings,
   favorites, messaging, offers, reviews, reports, alerts, admin.
   Run: node scripts/flow-test.js  (needs dev server on :3000) */

const BASE = process.env.BASE_URL || "http://localhost:3000";

let pass = 0, fail = 0;
const failures = [];
const notes = [];

function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; failures.push(name + (detail ? ` — ${detail}` : "")); console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`); }
}
function note(s) { notes.push(s); console.log(`  📝 ${s}`); }

class Jar {
  constructor() { this.map = {}; }
  absorb(res) {
    const sc = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    for (const c of sc) {
      const kv = c.split(";")[0];
      const i = kv.indexOf("=");
      this.map[kv.slice(0, i).trim()] = kv.slice(i + 1).trim();
    }
  }
  header() { return Object.entries(this.map).map(([k, v]) => `${k}=${v}`).join("; "); }
}
async function call(jar, method, path, body, headers = {}) {
  const h = { ...headers };
  if (jar && jar.header()) h.Cookie = jar.header();
  let payload;
  if (body !== undefined) { h["Content-Type"] = "application/json"; payload = JSON.stringify(body); }
  const res = await fetch(BASE + path, { method, headers: h, body: payload, redirect: "manual" });
  if (jar) jar.absorb(res);
  let data = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status: res.status, data, raw: text, headers: res.headers };
}

const stamp = Date.now();
const buyerEmail = `flow-buyer-${stamp}@example.com`;
const PASS = "FlowTest123!";

(async () => {
  console.log("\n════════ FLOW TEST SUITE ════════");

  // ── 1. AUTH ──
  console.log("\n🔐 AUTH");
  const seller = new Jar(), buyer = new Jar(), admin = new Jar();
  let r = await call(null, "POST", "/api/auth/register", {
    name: "Flow Buyer", email: buyerEmail, password: PASS,
    role: "buyer", location: "Metro Manila", phone: "09171234567",
  });
  check("register new buyer (201)", r.status === 201, `got ${r.status}`);
  note(`register emailSent=${r.data?.emailSent} requiresVerification=${r.data?.requiresVerification} (RESEND_API_KEY ${r.data?.emailSent ? "set" : "MISSING -> OTP email never arrives"})`);
  const buyerId = r.data?.user?.id;

  r = await call(buyer, "POST", "/api/auth/login", { email: buyerEmail, password: PASS });
  check("login as new buyer (200 + cookie)", r.status === 200 && Object.keys(buyer.map).length > 0, `got ${r.status}`);
  const buyerRole = r.data?.user?.role;

  r = await call(seller, "POST", "/api/auth/login", { email: "seller@baiandsil.ph", password: "password123" });
  check("login seed seller", r.status === 200, `got ${r.status}`);
  const sellerId = r.data?.user?.id;

  r = await call(admin, "POST", "/api/auth/login", { email: "admin@baiandsil.ph", password: "password123" });
  check("login seed admin", r.status === 200, `got ${r.status}`);
  check("admin flag set", r.data?.user?.isAdmin === true || r.data?.user?.role === "admin");

  r = await call(buyer, "GET", "/api/auth/me");
  check("/api/auth/me returns buyer", r.status === 200 && r.data?.user?.email === buyerEmail, `got ${r.status}`);

  // ── 2. LISTING LIFECYCLE (seller) ──
  console.log("\n📦 LISTING LIFECYCLE");
  r = await call(null, "GET", "/api/categories");
  const cat = r.data?.categories?.[0];
  check("categories load", r.status === 200 && cat, `got ${r.status}`);

  const listingBody = {
    title: "Flow Test Vintage Camera for Testing Purposes",
    description: "This is a detailed description used by the flow test suite to satisfy minimum length requirements and verify sanitization behavior across the marketplace.",
    price: 1500, categoryId: cat.id, condition: "Good", location: "Metro Manila",
    images: ["https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg"],
  };
  r = await call(seller, "POST", "/api/listings", listingBody);
  check("seller creates listing (201)", r.status === 201, `got ${r.status}: ${JSON.stringify(r.data)?.slice(0, 200)}`);
  const listing = r.data?.listing || r.data;
  const listingId = listing?.id; let slug = listing?.slug;

  r = await call(seller, "POST", "/api/listings", { ...listingBody, title: listingBody.title });
  check("slug de-collision (same title → new slug)", r.status === 201 && r.data?.listing?.slug !== slug, `got ${r.status}, slug=${r.data?.listing?.slug}`);
  const dupListingId = r.data?.listing?.id;

  r = await call(seller, "POST", "/api/listings", { ...listingBody, title: "x" });
  check("invalid short title rejected (400)", r.status === 400, `got ${r.status}`);

  r = await call(seller, "POST", "/api/listings", { ...listingBody, title: `<script>alert(1)</script>Flow Test XSS Title Here` });
  const xssTitle = r.data?.listing?.title || "";
  check("XSS in title sanitized", r.status === 201 && !xssTitle.includes("<script>"), `title=${xssTitle}`);
  const xssId = r.data?.listing?.id;
  if (xssId) await call(seller, "DELETE", `/api/listings/${xssId}`);

  r = await call(null, "GET", `/api/listings/${slug}`);
  check("public fetch by slug (200)", r.status === 200, `got ${r.status}`);
  const views1 = r.data?.listing?.viewCount ?? r.data?.viewCount;
  r = await call(buyer, "GET", `/api/listings/${slug}`);
  const views2 = r.data?.listing?.viewCount ?? r.data?.viewCount;
  check("viewCount increments for non-owner", typeof views2 === "number" && views2 > (views1 ?? 0), `${views1} → ${views2} body2=${JSON.stringify(r.data)?.slice(0, 200)}`);

  r = await call(seller, "PUT", `/api/listings/${listingId}`, { title: "Flow Test Vintage Camera (Edited Title) Updated" });
  check("owner edits listing (200)", r.status === 200, `got ${r.status}`);
  slug = r.data?.listing?.slug || slug;

  r = await call(buyer, "PUT", `/api/listings/${listingId}`, { title: "Hijack attempt title should fail here" });
  check("non-owner edit forbidden (403)", r.status === 403, `got ${r.status}`);

  r = await call(buyer, "POST", "/api/listings", { ...listingBody, title: "Buyer unverified listing attempt" });
  note(`unverified buyer create listing → ${r.status} (email-verified gate ${r.status === 201 ? "INACTIVE without RESEND_API_KEY" : "active"})`);
  if (r.status === 201) await call(buyer, "DELETE", `/api/listings/${r.data?.listing?.id || r.data?.id}`);

  // ── 3. FAVORITES ──
  console.log("\n❤️ FAVORITES");
  r = await call(buyer, "POST", `/api/listings/${listingId}/favorite`);
  check("favorite toggle on", r.status === 200 && r.data?.favorited === true, `got ${r.status} ${JSON.stringify(r.data)}`);
  r = await call(buyer, "GET", "/api/users/me/favorites");
  check("favorites list contains listing", r.status === 200 && (r.data?.favorites || r.data?.listings || []).some(f => f.id === listingId), `got ${r.status}`);
  r = await call(buyer, "POST", `/api/listings/${listingId}/favorite`);
  check("favorite toggle off", r.status === 200 && r.data?.favorited === false, `got ${r.status}`);
  await call(buyer, "POST", `/api/listings/${listingId}/favorite`); // leave ON for flow

  // ── 4. MESSAGING + OFFERS ──
  console.log("\n💬 MESSAGING & OFFERS");
  r = await call(buyer, "POST", "/api/conversations", { sellerId, listingId });
  check("create conversation (201/200)", (r.status === 201 || r.status === 200), `got ${r.status}: ${JSON.stringify(r.data)?.slice(0, 150)}`);
  const conv = r.data?.conversation || r.data;
  const convId = conv?.id;

  r = await call(buyer, "POST", `/api/conversations/${convId}/messages`, { message: "Hi! Is this still available? Flow test message." });
  check("buyer sends message (201)", r.status === 201, `got ${r.status}: ${JSON.stringify(r.data)?.slice(0, 150)}`);

  r = await call(seller, "GET", `/api/conversations/${convId}/messages`);
  check("seller reads thread with message", r.status === 200 && (r.data?.messages || []).length >= 1, `got ${r.status}, msgs=${(r.data?.messages || []).length}`);

  r = await call(seller, "POST", `/api/conversations/${convId}/messages`, { message: "Yes it is available, thanks for asking!" });
  check("seller replies (201)", r.status === 201, `got ${r.status}`);

  r = await call(buyer, "POST", `/api/conversations/${convId}/offers`, { amount: 1200 });
  check("buyer makes offer (201)", r.status === 201, `got ${r.status}: ${JSON.stringify(r.data)?.slice(0, 150)}`);
  const offerId = (r.data?.offer || r.data)?.id;

  r = await call(buyer, "POST", `/api/conversations/${convId}/offers`, { amount: 1600 });
  check("offer above listing price rejected (400)", r.status === 400, `got ${r.status}`);

  r = await call(buyer, "POST", `/api/conversations/${convId}/offers`, { amount: 1000000000 });
  check("out-of-range offer rejected (400)", r.status === 400, `got ${r.status}`);

  r = await call(buyer, "POST", `/api/conversations/${convId}/offers`, { amount: 1200 });
  note(`second pending offer by same buyer on same listing → ${r.status} (duplicate-offer guard ${r.status === 409 ? "exists" : "MISSING"})`);

  r = await call(seller, "GET", `/api/conversations/${convId}/offers`);
  check("seller sees offer (200)", r.status === 200 && (r.data?.offers || []).length >= 1, `got ${r.status}`);

  r = await call(buyer, "PUT", `/api/listings/${listingId}/offers/${offerId}`, { status: "Accepted" });
  check("buyer cannot accept own offer (403)", r.status === 403, `got ${r.status}`);

  r = await call(seller, "PUT", `/api/listings/${listingId}/offers/${offerId}`, { status: "Accepted" });
  check("seller accepts offer (200)", r.status === 200, `got ${r.status}: ${JSON.stringify(r.data)?.slice(0, 150)}`);

  r = await call(null, "GET", `/api/listings/${listingId}`);
  const st = r.data?.listing?.status || r.data?.status;
  check("listing auto-Reserved after accept", st === "Reserved", `status=${st}`);

  r = await call(seller, "PUT", `/api/listings/${listingId}/offers/${offerId}`, { status: "Declined" });
  check("double-respond rejected (400)", r.status === 400, `got ${r.status}`);

  // ── 5. NOTIFICATIONS ──
  console.log("\🔔 NOTIFICATIONS");
  r = await call(seller, "GET", "/api/notifications");
  const sellerNotifs = r.data?.notifications || [];
  check("seller got offer notification", r.status === 200 && sellerNotifs.some(n => /offer/i.test(n.message || n.title || n.type || "")), `count=${sellerNotifs.length}`);
  r = await call(buyer, "GET", "/api/notifications");
  const buyerNotifs = r.data?.notifications || [];
  check("buyer got accept + message notifications", r.status === 200 && buyerNotifs.length >= 2, `count=${buyerNotifs.length}`);
  r = await call(buyer, "GET", "/api/notifications/count");
  check("unread count endpoint", r.status === 200, `got ${r.status}`);
  r = await call(buyer, "PUT", "/api/notifications", {});
  check("mark all read", r.status === 200, `got ${r.status}`);
  r = await call(buyer, "GET", "/api/notifications/count");
  const cnt = r.data?.count;
  check("count drops to 0", cnt === 0, `count=${cnt}`);

  // ── 6. REVIEWS ──
  console.log("\n⭐ REVIEWS");
  r = await call(seller, "PUT", `/api/listings/${listingId}/status`, { status: "Sold" });
  check("seller marks listing Sold", r.status === 200, `got ${r.status}`);

  r = await call(buyer, "POST", "/api/reviews", { listingId, revieweeId: sellerId, rating: 5, comment: "Great seller, smooth transaction! Thanks from the flow test." });
  check("buyer reviews sold listing (201)", r.status === 201, `got ${r.status}: ${JSON.stringify(r.data)?.slice(0, 150)}`);

  r = await call(null, "GET", `/api/users/${sellerId}`);
  const rating = r.data?.user?.rating ?? r.data?.rating;
  check("seller rating updated", Number(rating) > 0, `rating=${rating}`);

  r = await call(buyer, "POST", "/api/reviews", { listingId, revieweeId: sellerId, rating: 4, comment: "Duplicate review attempt should be blocked properly." });
  check("duplicate review blocked (409)", r.status === 409, `got ${r.status}`);

  r = await call(buyer, "POST", "/api/reviews", { listingId, revieweeId: buyerId, rating: 5, comment: "Self review attempt to check guard rails here." });
  check("self-review blocked", r.status !== 201, `got ${r.status} — ${r.status === 201 ? "BUG: users can review themselves" : "blocked"}`);

  r = await call(seller, "POST", "/api/reviews", { listingId, revieweeId: sellerId, rating: 5, comment: "Seller reviewing own sold listing attempt for guard check." });
  check("owner self-review blocked", r.status !== 201, `got ${r.status} — ${r.status === 201 ? "BUG: owner can inflate own rating" : "blocked"}`);

  // ── 7. REPORTS ──
  console.log("\n🚩 REPORTS");
  r = await call(buyer, "POST", `/api/listings/${listingId}/report`, { reason: "scam", description: "legacy lowercase value still accepted" });
  check("report with legacy lowercase 'scam' accepted (201)", r.status === 201, `got ${r.status}: ${JSON.stringify(r.data)?.slice(0, 150)}`);

  r = await call(buyer, "POST", `/api/listings/${listingId}/report`, { reason: "Prohibited", description: "canonical UI reason, duplicate target" });
  check("duplicate report blocked (409)", r.status === 409, `got ${r.status} (400 would mean canonical reason failed validation)`);

  r = await call(buyer, "POST", `/api/listings/${listingId}/report`, { reason: "not-a-real-reason", description: "invalid reason" });
  check("invalid reason rejected (400)", r.status === 400, `got ${r.status}`);

  r = await call(buyer, "POST", `/api/users/${sellerId}/report`, { reason: "Wrong Information", description: "canonical UI reason for user report" });
  check("user report with canonical UI reason accepted (201)", r.status === 201, `got ${r.status}: ${JSON.stringify(r.data)?.slice(0, 150)}`);

  r = await call(buyer, "POST", `/api/users/${sellerId}/report`, { reason: "Because I said so", description: "invalid reason" });
  check("invalid user-report reason rejected (400)", r.status === 400, `got ${r.status}`);

  // ── 8. PRICE ALERTS + SAVED SEARCHES ──
  console.log("\n🔔 PRICE ALERTS & SAVED SEARCHES");
  r = await call(buyer, "POST", "/api/price-alerts", { listingId });
  check("subscribe price alert (201)", r.status === 201, `got ${r.status}`);
  r = await call(buyer, "GET", "/api/price-alerts");
  check("active alert listed", r.status === 200 && (r.data?.alerts || []).length === 1, `count=${(r.data?.alerts || []).length}`);
  r = await call(buyer, "POST", "/api/price-alerts", { listingId });
  check("unsubscribe toggle works", r.status === 200 && r.data?.subscribed === false, `got ${r.status}`);
  r = await call(buyer, "POST", "/api/price-alerts", { listingId });
  check("resubscribe reactivates alert", r.status === 200 || r.status === 201, `got ${r.status}`);
  r = await call(seller, "PUT", `/api/listings/${listingId}`, { price: 999 });
  check("seller drops price 1500 → 999", r.status === 200, `got ${r.status}`);
  r = await call(buyer, "GET", "/api/notifications");
  check("price-drop notification fired", r.status === 200 && (r.data?.notifications || []).some((n) => n.type === "price"), `price-notifications=${(r.data?.notifications || []).filter((n) => n.type === "price").length}`);

  r = await call(buyer, "POST", "/api/searches", { name: "Cameras under 2k", query: "camera", category: cat.slug });
  check("save search (201/200)", r.status === 201 || r.status === 200, `got ${r.status}`);
  const savedId = (r.data?.search || r.data)?.id;
  r = await call(buyer, "GET", "/api/searches");
  check("saved searches listed", r.status === 200 && (r.data?.searches || []).length >= 1, `got ${r.status}`);
  const searchPage = await call(null, "GET", "/search");
  check("search page renders saved-searches UI", searchPage.status === 200 && typeof searchPage.raw === "string" && searchPage.raw.includes("Save search"), `got ${searchPage.status}`);
  if (savedId) {
    r = await call(buyer, "DELETE", `/api/searches?id=${savedId}`);
    check("delete saved search", r.status === 200, `got ${r.status}`);
  }

  // ── 9. SELLER STATS + EXPORT ──
  console.log("\n📊 SELLER STATS");
  r = await call(seller, "GET", "/api/seller/stats");
  check("seller stats (200)", r.status === 200 && typeof r.data?.totalListings !== "undefined", `got ${r.status} body=${JSON.stringify(r.data)?.slice(0, 250)}`);
  r = await call(seller, "GET", "/api/seller/stats?export=1");
  check("CSV export data (200)", r.status === 200, `got ${r.status}`);

  // ── 10. UPLOAD ──
  console.log("\n🖼️ UPLOAD");
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
  const form = new FormData();
  form.append("file", new Blob([png], { type: "image/png" }), "pixel.png");
  const upRes = await fetch(BASE + "/api/upload", { method: "POST", headers: { Cookie: buyer.header() }, body: form });
  const upData = await upRes.json().catch(() => null);
  check("image upload works (200/201)", upRes.status === 200 || upRes.status === 201, `got ${upRes.status}: ${JSON.stringify(upData)?.slice(0, 120)}`);
  note(`upload returns ${upRes.status} (route returns plain 200, not REST-conventional 201)`);

  // ── 11. MIDDLEWARE / ACCESS CONTROL ──
  console.log("\n🛡️ ACCESS CONTROL");
  r = await call(null, "GET", "/sell");
  check("anonymous /sell → 307 login redirect", r.status === 307 || r.status === 308, `got ${r.status}`);
  r = await call(buyer, "GET", "/api/admin/users");
  check("buyer blocked from admin API (403)", r.status === 403, `got ${r.status}`);
  r = await call(null, "GET", "/admin");
  check("anonymous /admin → 307", r.status === 307 || r.status === 308, `got ${r.status}`);
  r = await call(buyer, "GET", "/api/listings", undefined, {});
  const rl = r.headers.get("x-ratelimit-remaining");
  check("rate-limit headers present", rl !== null, `remaining=${rl}`);

  // ── 12. ADMIN ──
  console.log("\n👑 ADMIN");
  r = await call(admin, "GET", "/api/admin/users");
  check("admin lists users", r.status === 200 && (r.data?.users || []).some(u => u.email === buyerEmail), `got ${r.status}`);
  r = await call(admin, "GET", "/api/admin/listings");
  check("admin lists listings", r.status === 200, `got ${r.status}`);
  r = await call(admin, "GET", "/api/admin/reports");
  const reports = r.data?.reports || [];
  check("admin lists reports", r.status === 200 && reports.length >= 1, `count=${reports.length}`);
  const myReport = reports.find(x => x.listingId === listingId);
  if (myReport) {
    check("stored report reason normalized to canonical 'Scam'", myReport.reason === "Scam", `stored=${myReport.reason}`);
    r = await call(admin, "PUT", "/api/admin/reports", { id: myReport.id, status: "Reviewed" });
    check("admin updates report status", r.status === 200, `got ${r.status}: ${JSON.stringify(r.data)?.slice(0, 120)}`);
  } else note("created report not visible in admin list (report association issue)");
  r = await call(admin, "PUT", `/api/admin/users/${buyerId}`, { emailVerified: true });
  check("admin verifies user (200)", r.status === 200, `got ${r.status}: ${JSON.stringify(r.data)?.slice(0, 120)}`);

  // ── 13. CLEANUP ──
  console.log("\n🧹 CLEANUP");
  r = await call(seller, "DELETE", `/api/listings/${listingId}`);
  check("delete own listing", r.status === 200, `got ${r.status}`);
  r = await call(null, "GET", `/api/listings/${slug}`);
  check("deleted listing → 404", r.status === 404, `got ${r.status}`);
  if (dupListingId) await call(seller, "DELETE", `/api/listings/${dupListingId}`);
  r = await call(admin, "DELETE", `/api/admin/users/${buyerId}`);
  check("admin deletes test user", r.status === 200, `got ${r.status}: ${JSON.stringify(r.data)?.slice(0, 120)}`);
  r = await call(null, "POST", "/api/auth/login", { email: buyerEmail, password: PASS });
  check("deleted user cannot log in", r.status >= 400, `got ${r.status}`);
  r = await call(admin, "POST", "/api/auth/logout");
  check("logout clears session", r.status === 200, `got ${r.status}`);

  // ── SUMMARY ──
  console.log("\n════════ RESULTS ════════");
  console.log(`✅ ${pass} passed   ❌ ${fail} failed   📝 ${notes.length} notes`);
  if (failures.length) { console.log("\nFailures:"); failures.forEach(f => console.log(`  ❌ ${f}`)); }
  if (notes.length) { console.log("\nNotes:"); notes.forEach(n => console.log(`  📝 ${n}`)); }
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("FATAL:", e); process.exit(2); });
