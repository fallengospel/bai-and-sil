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
| 5 | Error Handling & Feedback | ⬜ Not started | H11, C5, M16, empty/loading states | ⬜ | ⬜ |
| 6 | Flows & Data Polish | ⬜ Not started | M6, M8–M12, M21–M23, M28, M30, M32 | ⬜ | ⬜ |
| 7 | Visual Consistency | ⬜ Not started | L1–L3, M26, admin/dash unify | ⬜ | ⬜ |
| 8 | Accessibility | ⬜ Not started | L6–L9, M13, contrast, keyboard | ⬜ | ⬜ |
| 9 | Final Verification & Deploy | ⬜ Not started | all | ⬜ | ⬜ |

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

## Phase 5 — Error Handling & Feedback 🛡
**Purpose:** Never fail silently.

- [ ] **H11** Audit every `!res.ok` / `catch {}` in: `messages/[id]` (sendMessage, handleSendOffer), `search`, `notifications` (markAllRead), `profile` (handleSaveProfile), `admin/users|listings|reports` mutations → add `toast.error`, stop optimistic updates on failure
- [ ] **C5 continued** ReportModal error path verified
- [ ] **Inline field errors:** wire `Input`/`Select`/`TextArea` `error` prop on login, register, sell, edit forms (server `errors` map → field errors)
- [ ] **M25** Add nested `error.tsx` for `/admin` and `/messages`; add `global-error.tsx`
- [ ] **Infinite spinner risks:** `/messages` inbox — resolve loading when `currentUserId` null; `/profile/me` — timeout/escape hatch
- [ ] **Empty states:** admin tables use `EmptyState`; buyer dashboard saved-items section shows empty state instead of hiding
- [ ] **M15** Replace native `confirm()` with `Modal` in `ListingClient`, admin listings/users/reports
- [ ] **Logout:** toast on logout failure instead of `console.error`

**Exit criteria:** Force a 401/500 → user sees a message; no page can spin forever; all destructive actions confirm consistently.

---

## Phase 6 — Flows & Data Polish ✨
**Purpose:** Smooth the existing journeys.

- [ ] **M6/M29** Search: single apply model — remove duplicate sort or make all filters auto-apply consistently
- [ ] **M8** Location select: group by province (`<optgroup>`), or searchable combobox
- [ ] **M9** Offers page: Accept/Decline buttons (reuse thread API) + link to conversation
- [ ] **M10** Interleave offers with messages chronologically in thread
- [ ] **M11** Quick prompts: send on tap but with 3s undo toast (or confirm chip)
- [ ] **M12** Notifications: mark read on click, per-item read state, poll/refresh, error handling
- [ ] **M32** Pause polling when `document.hidden` (chat 5s + navbar 60s)
- [ ] **M21** Profile phone privacy toggle (show/hide on public profile)
- [ ] **M20** Hide Favorites tab for non-owners
- [ ] **M22** Profile listings: fetch by seller (API param) instead of global `limit=50`
- [ ] **M23** Draft persistence: `localStorage` drafts for sell wizard, edit form, register step
- [ ] **M27** "Member for" copy → "Member since {Month Year}"
- [ ] **M28** Centralize condition→color map in one helper (used by ProductCard, ListingClient, Badge)
- [ ] **M30** `viewCount`: skip increment on edit-owner fetch (or move to POST/view endpoint)

**Exit criteria:** Offers actionable; notifications clickable; drafts survive refresh; one condition map.

---

## Phase 7 — Visual Consistency 🎨
**Purpose:** One design system, no drift.

- [ ] **L1/L3** Single blue: make `globals.css` buttons and `LandingPage.tsx` use Tailwind tokens (`jeepney`/`bai-blue` — pick one canonical token); remove double-applied `btn-* bg-*` conflicts in `Button.tsx`
- [ ] **L2** Radius scale: pick 2 radii (e.g. `rounded-2xl` cards, `rounded-lg` controls) and apply to Button, Modal, admin badges
- [ ] **Shared `StatCard`** component; replace 13 copy-pasted KPI cards (seller 6, admin 4, buyer 3)
- [ ] **M26** Admin: adopt card/badge/button tokens so admin matches consumer UI
- [ ] **Spinner consolidation:** all raw `animate-spin` divs → `LoadingSpinner`
- [ ] **Toast position:** move below navbar on mobile or use `position: 'top-center'` on small screens (**L14**)
- [ ] **Landing IA:** categories from API instead of hardcoded slugs (**M5**)
- [ ] **H8** Dark mode decision: either remove toggle + tokens (recommended, honest) or complete dark styles for cards/nav/tables/modals; also fix provider remount flash (lazy `useState` init in `ThemeProvider`/`I18nProvider`)

**Exit criteria:** One blue, ≤2 radii, no copy-pasted KPI markup, toggle matches reality.

---

## Phase 8 — Accessibility ♿
**Purpose:** WCAG 2.1 AA baseline.

- [ ] **M14** `useId()` + `htmlFor`/`id` on `Input`, `Select`, `TextArea` (fixes every form at once)
- [ ] **M13** Modal: `role="dialog"`, `aria-modal`, `aria-labelledby`, focus trap, initial focus, `aria-label` on close
- [ ] **L7** `aria-label` on all icon-only buttons (hamburger, theme, language, gallery zoom, back, close, image-remove)
- [ ] **L6** OTP inputs: `autocomplete="one-time-code"`, `inputMode="numeric"`, labels
- [ ] **L9** `aria-live="polite"` region for toasts + inline form errors
- [ ] **Keyboard:** dropzone + gallery zoom keyboard-operable (`role="button"`, `tabIndex`, `onKeyDown`); tabs get `role="tablist/tab/tabpanel"`
- [ ] **L13** `prefers-reduced-motion` media query disabling float/wiggle/pulse/count-up
- [ ] **Contrast:** fix white-on-yellow Sell buttons (dark text on `sil-yellow`), `text-gray-400` timestamps → `gray-500/600`
- [ ] **L11** Heart touch target ≥44px; **L8** meaningful `alt` text
- [ ] **M18** `generateMetadata` for listing detail + `metadataBase` in layout
- [ ] Remove `<Link><Button>` nesting (≥5 spots)

**Exit criteria:** Tab-through of login + listing detail works with visible focus; labels announce; axe/manual spot-check clean.

---

## Phase 9 — Final Verification & Deploy 🚀
- [ ] Full QA: `node scripts/qa-test.js` → 50/50 (update tests if behavior intentionally changed)
- [ ] Browser tests via `/admin/testing` (dev)
- [ ] `npx next build` passes (stop dev node processes first)
- [ ] Manual pass: landing, search+filters, listing detail (SSR clean), sell wizard incl. draft restore, edit, messages on mobile, favorites toggle, offers accept/decline, notifications, seller/buyer/admin on 375px, login/register/OTP, dark toggle behavior
- [ ] `dev-err.log` reviewed — no `window is not defined`, no new errors
- [ ] Update `docs/ux-ui-review.md` change log (issues resolved)
- [ ] Merge `testing` → `staging` → verify → `main` → Vercel deploy
- [ ] Post-deploy smoke test on https://bai-and-sil.vercel.app/

---

## Working Rules
1. One phase at a time; verify (QA + build) before marking done.
2. **Per-phase promotion:** all work commits to `testing` → QA + build + manual checks → merge to `staging`, pull and re-test → merge to `main`, smoke-test on `main` (pre-deploy sanity + post-deploy live check on https://bai-and-sil.vercel.app/). Main only receives phases that passed staging.
3. Small, focused commits; commit messages reference issue IDs (e.g. `fix(H2): wire favorite toggle on search/favorites/profile`).
4. No new features — existing features only.
5. Update the Progress Tracker above at the end of each phase (set Verified + Deployed after main).
6. If a phase reveals a product decision (e.g. i18n remove vs wire, dark mode, Resend), stop and ask.
