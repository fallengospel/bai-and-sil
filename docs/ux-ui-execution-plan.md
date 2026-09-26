# BAI & SIL — UX/UI Improvement Execution Plan

**Goal:** Improve the UX/UI experience of existing features, start to finish.
**Source:** `docs/ux-ui-review.md` (issue IDs C1–C6, H1–H12, M1–M34, L1–L14).
**Git flow (per phase):** `testing` → run all tests → merge `staging` → re-test → merge `main` → smoke-test on main → Vercel deploy. Main must receive fewer bugs, so every phase is verified twice (staging) and again on main before/after deploy.
**Verification every phase:** `node scripts/qa-test.js` must stay at 50/50; `npx next build` must pass; spot-check affected pages on port 3000.

---

## Progress Tracker

| Phase | Name | Status | Issues | Verified | Deployed |
|---|---|---|---|---|---|
| 0 | Baseline & Setup | ✅ Done | — | ✅ | — |
| 1 | Critical Fixes | ✅ Done | C1–C6 | ✅ | ✅ |
| 2 | Core Interaction Fixes | ✅ Done | H2–H7, H9–H12 | ✅ | ✅ |
| 3 | Mobile & Navigation | ✅ Done | C2, H1, M1, M7, M16, M33, L4 | ✅ | ✅ |
| 4 | Dead & Misleading Features | ✅ Done | H3, M2, M3, M34, M24, M27b, L5, M31 | ✅ | ✅ |
| 5 | Error Handling & Feedback | ✅ Done | H11, C5, M15, M25 + inline errors, spinners, empty states | ✅ | ✅ |
| 6 | Flows & Data Polish | ✅ Done | M6, M8–M12, M20–M23, M27, M28, M30, M32 | ✅ | ✅ |
| 7 | Visual Consistency | ✅ Done | L1–L3, L14, M5, M26, H8 (dark mode removed), StatCard, spinners | ✅ | ✅ |
| 8 | Accessibility | ✅ Done | L6–L9, L11, L13, L14(Phase 7), M13, M14, M18, contrast, keyboard | ✅ | ✅ |
| 9 | Final Verification & Deploy | ✅ Done | all | ✅ (automated; browser manual pass pending) | ✅ |

**Status legend:** ⬜ Not started · 🔄 In progress · ✅ Done · ⏸ Blocked

---

## Phase 0 — Baseline & Setup ✅ (2026-09-25)
**Purpose:** Know what "working" looks like before touching anything.

- [x] Run `node scripts/qa-test.js` → **baseline: 50/50 passed**
- [x] Run `npx next build` → **baseline: pass** (1 route λ server-rendered, rest static, middleware OK)
- [x] Work on branch `testing` directly (all phase work lands on `testing` first per git flow)
- [x] Dev server verified responding (localhost:3000, HTTP 200)

**Exit criteria met:** Baselines recorded, key pages reachable.

---

## Phase 1 — Critical Fixes 🔴 ✅ (2026-09-25)
**Purpose:** Unblock the broken core tasks.

- [x] **C1** Move `window.location.href` out of render in `ListingClient.tsx` (safe `/listing/{slug}` fallback; component uses `window` client-side only) → SSR crash gone, listing detail 200
- [x] **C2** Chat thread height `h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]` + global `pb-16 md:pb-0` on page wrapper → composer/footer clear MobileNav
- [x] **C3** Report flag button added to listing detail CTAs → opens ReportModal
- [x] **C4** Profile "Message" now finds existing conversation or creates one via `POST /api/conversations` and navigates to the thread
- [x] **C5** ReportModal only shows success on `res.ok`; error toasts otherwise
- [x] **C6** Gate relaxed (user decision): `emailVerified` enforced only when `RESEND_API_KEY` is set; TODO to re-enable when Resend is configured

**Verified:** testing QA 50/50 + build ✅ → staging QA 50/50 + build ✅ → main QA 50/50 ✅ → live smoke: root 200, listing 200, report button present on https://bai-and-sil.vercel.app/ ✅

---

## Phase 2 — Core Interaction Fixes 🟠 ✅ (2026-09-25)
**Purpose:** Make existing interactions actually work.

- [x] **H2** `toggleFavorite` helper (`src/lib/favorites.ts`); wired on Search, Favorites, Profile, Buyer Dashboard with real favorited state (favorites fetched on mount); guests get login toast
- [x] **H5** Offer status mapping fixed: `Declined → red` in `offers/page.tsx`
- [x] **H6** Real user reports: `Report` schema gained `reportedUserId` + nullable `listingId` (`db push` applied to Neon); new `POST /api/users/[id]/report`; `ReportModal` targets user or listing; admin reports shows Target column with null-guards
- [x] **H7** New `GET /api/seller/stats` (server-side aggregates per seller) + `?export=1` for full CSV; dashboard rewired; "Conversion" relabeled "Sell-Through"
- [x] **H9** `/listing/[slug]/edit` added to middleware (`isEditPage` regex + matcher) + page-level ownership/admin check; **bonus fix:** GET listings API now resolves slugs (edit page previously couldn't load at all)
- [x] **H10** Sell unified: any authenticated non-admin can sell (Navbar desktop + mobile + dropdown match MobileNav; API already role-agnostic)
- [x] **H12** Remove-image buttons visible without hover on touch (`opacity-100 md:opacity-0 md:group-hover:opacity-100`)
- [x] **H4** Bulk delete now shows a `Modal` confirmation with per-item failure reporting

**Verified:** testing QA 50/50 + build ✅ → staging QA 50/50 + build ✅ → main QA 50/50 ✅ → live: root/listing 200, `/api/seller/stats` 401 (auth-gated), slug GET 200 ✅

---

## Phase 3 — Mobile & Navigation 📱 ✅ (2026-09-25)
**Purpose:** Full usability on phones.

- [x] **H1** Mobile chip-nav added to admin, seller, buyer layouts (sticky, horizontally scrollable, correct active states via `usePathname`)
- [x] **C2** (from Phase 1) chat thread + global bottom padding already fixed
- [x] **M1** Hamburger de-duplicated vs bottom nav (removed Messages/My Profile links; kept Offers, Notifications, Dashboard, Logout)
- [x] **M33** Dedicated 1-tap mobile search: search icon in header opens autofocused search row (mutually exclusive with hamburger)
- [x] **M7** Mobile filters collapsible ("Show/Hide Filters" toggle, default collapsed, `aria-expanded`); results visible immediately
- [x] **L4** `.safe-area-bottom` defined (`env(safe-area-inset-bottom)`)
- [x] **M16** Admin tables wrapped in `overflow-x-auto` with `min-w` (3 pages)
- [x] **M34** (early) Testing link dev-gated in admin nav + middleware redirects `/admin/testing` → `/admin` in production

**Verified:** testing QA 50/50 + build ✅ → staging QA 50/50 + build ✅ → main QA 50/50 ✅ → live: root/search 200, `/admin/testing` 307 → login ✅

---

## Phase 4 — Dead & Misleading Features 🧹 ✅ (2026-09-25)
**Purpose:** Remove lies and dead ends.

- [x] **M2/M3** i18n decision: **remove** Globe toggle + `I18nProvider` dead dictionary (recommended — zero call sites), or wire up `t()` on landing + nav (bigger scope). Default: remove.
- [x] **M3** Keep theme toggle available to guests (move out of `user ?` block)
- [x] **M34** Dev-gate `/admin/testing`: hide sidebar link unless `NODE_ENV !== 'production'` (+ middleware block)
- [x] **H3** Related Items: pass `relatedListings` (same category, exclude current) from `listing/[slug]/page.tsx`
- [x] **M24** Fix sell preview card dead link (`/listing/preview`) — render non-link preview
- [x] **M27b** Buyer dashboard: remove fabricated "Browsing: Active"; rename "Recommended" → "Latest on BAI & SIL" or compute real recommendations
- [x] **L5** Footer: de-dupe `/categories`, add Help/Contact/About or Safety/Report; fix social URLs (remove if placeholder)
- [x] **M31** UXTestingMode: label hardcoded results as static or remove "Re-analyze" (dev-only, low priority)

**Exit criteria:** No dead links, no fake stats, no dead toggles, testing page hidden in prod.

---

## Phase 5 — Error Handling & Feedback 🛡 ✅ (2026-09-25)
**Purpose:** Never fail silently.

- [x] **H11** Audited mutations → `toast.error` + no optimistic update on failure: chat sendMessage/handleSendOffer/handleOfferAction, notifications markAllRead, profile handleSaveProfile, admin users/listings/reports (status + delete), ListingClient status/delete/offer POST (favorites already covered by `lib/favorites.ts`)
- [x] **C5 continued** ReportModal error path verified (Phase 1)
- [x] **Inline field errors:** server `errors` map wired to `Input`/`Select`/`TextArea` `error` prop on login, register (incl. client password mismatch), sell (jumps back to step 2 on validation failure), edit forms
- [x] **M25** Nested `error.tsx` added for `/admin` and `(main)/messages`; `global-error.tsx` added
- [x] **Infinite spinner risks:** `/messages` resolves + redirects to login when auth fetch fails/null; `/profile/me` has 8s timeout escape hatch
- [x] **Empty states:** admin users/listings/reports tables use `EmptyState`; buyer dashboard saved-items section now always renders with empty state
- [x] **M15** New `ui/ConfirmDialog.tsx`; native `confirm()` replaced in ListingClient, admin users/listings/reports
- [x] **Logout:** `toast.error` on logout failure (Navbar + AuthProvider)

**Verified:** testing QA 50/50 + build ✅ → staging QA 50/50 + build ✅ → main QA 50/50 ✅ → live root/login 200, /messages 307→login ✅

---

## Phase 6 — Flows & Data Polish ✨ ✅ (2026-09-25)
**Purpose:** Smooth the existing journeys.

- [x] **M6/M29** Search: duplicate sidebar sort removed; single top-bar sort + explicit "Apply Filters" for filter set
- [x] **M8** Location select: `<optgroup>` by province — `Select` now supports `group`, shared `getLocationOptions()` in `helpers.ts` (5 call sites)
- [x] **M9** Offers page: Accept/Decline buttons for pending received offers (reuse thread API) + "Conversation" link via `conversationId`
- [x] **M10** Thread: messages + offers merged into one chronological timeline
- [x] **M11** Quick prompts: two-tap confirm chip ("Send? Tap again", 3s auto-reset)
- [x] **M12** Notifications: mark read on click (optimistic, single-ID PUT), 30s poll, 401 → login, error toasts
- [x] **M32** Polling paused when `document.hidden` (chat 5s, navbar 60s, notifications 30s)
- [x] **M21** Profile phone privacy: `User.phonePublic` schema field (db pushed to Neon), API hides phone from non-owners when off, edit-modal toggle
- [x] **M20** Favorites tab only shown to profile owner
- [x] **M22** Profile listings fetched via `?sellerId=` param (added to `GET /api/listings`)
- [x] **M23** localStorage drafts: sell wizard (incl. step), edit form (restored w/ toast, cleared on save/cancel), register (never passwords)
- [x] **M27** "Member for N days" → "Member since {Mon Year}"; buyer "Days Active" → "Member Since"
- [x] **M28** Canonical `lib/condition.ts` `getConditionVariant()` (ProductCard + ListingClient)
- [x] **M30** `viewCount` skipped when requester is the owner (edit-page fetch)

**Verified:** testing QA 50/50 + build ✅ → staging QA 50/50 + build ✅ → main QA 50/50 ✅ → live root/search/login 200, /offers 307→login ✅

---

## Phase 7 — Visual Consistency 🎨 ✅ (2026-09-25)
**Purpose:** One design system, no drift.

- [x] **L1/L3** Single blue: `bai-blue #023E8A` is canonical — all `#0F3D91` (jeepney) and `#EAF0FB` hexes converted to tokens; `globals.css` btn-* now token-based; `Button.tsx` variants no longer double-apply conflicting classes; `jeepney` token removed; `text-[#101B3A]` → `text-ink`
- [x] **L2** Radius scale: 2 radii — `rounded-2xl` (surfaces/cards/modal/gallery) + `rounded-lg` (buttons/inputs/badges/tabs/chips); circles (avatars, spinners, progress, dots) stay `rounded-full`
- [x] **Shared `StatCard`** — `components/ui/StatCard.tsx` (sm/md sizes); replaced seller 6 + admin 4 + buyer 3 KPI cards
- [x] **M26** Admin tokens: h1 color classes fixed; admin layout/nav/badges already token-based (Phases 3–5)
- [x] **Spinner consolidation:** raw `animate-spin` divs → `LoadingSpinner` (added `inline` prop for in-button use); FiLoader icon spins + Button internal loader kept
- [x] **L14** Toast position: `AppToaster` client component — `top-center` + 72px offset on mobile, `top-right` on desktop
- [x] **M5** Landing categories fetched from `GET /api/categories` (top 6 by listingCount, icons mapped from DB icon field, hardcoded fallback on failure)
- [x] **H8** Dark mode removed (per user decision): `ThemeProvider` deleted, toggle removed from Navbar, all `dark:` classes + `dark` palette + `darkMode:'class'` stripped, `suppressHydrationWarning` removed

**Exit criteria:** One blue ✅, 2 rectangular radii + circles ✅, no copy-pasted KPI markup ✅, no misleading toggle ✅.

**Verified:** testing QA 50/50 + build ✅ → staging QA 50/50 + build ✅ → main QA 50/50 ✅ → live root/search/login 200 ✅.

---

## Phase 8 — Accessibility ♿ ✅ (2026-09-25)
**Purpose:** WCAG 2.1 AA baseline.

- [x] **M14** `useId()` + `htmlFor`/`id` on `Input`, `Select`, `TextArea` + `aria-invalid`/`aria-describedby` error wiring
- [x] **M13** Modal: `role="dialog"`, `aria-modal`, `aria-labelledby`, Tab focus trap, initial focus + restore, `aria-label="Close dialog"`
- [x] **L7** `aria-label` on icon-only controls (Navbar bell/messages, image-remove in sell/edit/FileUpload, gallery zoom/thumbnails, hamburger/search)
- [x] **L6** OTP: `autocomplete="one-time-code"` (first input), `aria-label` per digit, `role="group"`
- [x] **L9** `role="alert"` on field errors (Input/Select/TextArea); toasts use react-hot-toast's default `role="status"`/`aria-live`
- [x] **Keyboard:** sell/edit dropzones `role="button"`+Enter/Space, gallery zoom keyboard-operable, admin testing tabs `role="tablist/tab/tabpanel"` + `aria-selected`
- [x] **L13** `prefers-reduced-motion` disables float/pulse-ring/count-up/page-transition + shortens transitions
- [x] **Contrast:** white-on-yellow buttons/stickers → `text-ink`; all 57 `text-gray-400` text → `text-gray-500`
- [x] **L11** Heart touch target ≥44px (`p-3.5 -m-1.5` + min 44px); **L8** meaningful `alt` (upload previews, profile thumbs, FileUpload)
- [x] **M18** `generateMetadata` on listing detail (title/desc/OG + first image) + `metadataBase` in root layout
- [x] Removed 5 `<Link><Button>` nestings (reset-password ×2, verify-email, ListingClient edit, my-listings)

**Exit criteria:** tab-through works with visible focus ✅; labels announce ✅; metadata live (verified `<title>` on Vercel) ✅.

**Verified:** testing QA 50/50 + build ✅ → staging QA 50/50 + build ✅ → main QA 50/50 ✅ → live root/listing/login 200, real listing `<title>` renders ✅.

---

## Phase 9 — Final Verification & Deploy 🚀 ✅ (2026-09-26)
- [x] Full QA: `node scripts/qa-test.js` → 50/50 on testing, staging, and main (Phase 8 runs; no test changes needed)
- [ ] **Manual (user):** browser suite at `/admin/testing` (no headless browser deps in repo — requires clicking in a browser)
- [x] `npx next build` passes (no stray dev node processes)
- [x] Route smoke via dev + live: landing, search, login, register 200; favorites/offers/notifications/messages/sell/my-listings 307→login (auth-gated, correct); listing detail SSR 200 with real `<title>` on dev + Vercel; `/api/listings` live 200
- [x] `dev-err.log` reviewed — stale (last write 2026-09-04, pre-M18); no `window is not defined`/`ReferenceError`; `metadataBase` now set in `layout.tsx:26` (warning resolved)
- [x] `docs/ux-ui-review.md` change log updated (Phases 7 + 8)
- [x] Merge `testing` → `staging` → `main` → Vercel deployed (Phase 8 tip `1abcb18`)
- [x] Post-deploy smoke: root/listing/login 200; live listing `<title>` = "Celestron PowerSeeker Telescope - ₱5,500 | BAI AND SIL" (M18 verified live)
- **Note:** dark-mode manual item superseded — dark mode removed by user decision in Phase 7. 375px visual pass + `/admin/testing` browser suite remain for a human in a real browser (qa-test.js is API/SSR-level only).

---

## Working Rules
1. One phase at a time; verify (QA + build) before marking done.
2. **Per-phase promotion:** all work commits to `testing` → QA + build + manual checks → merge to `staging`, pull and re-test → merge to `main`, smoke-test on `main` (pre-deploy sanity + post-deploy live check on https://bai-and-sil.vercel.app/). Main only receives phases that passed staging.
3. Small, focused commits; commit messages reference issue IDs (e.g. `fix(H2): wire favorite toggle on search/favorites/profile`).
4. No new features — existing features only.
5. Update the Progress Tracker above at the end of each phase (set Verified + Deployed after main).
6. If a phase reveals a product decision (e.g. i18n remove vs wire, dark mode, Resend), stop and ask.
