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
| 1 | Critical Fixes | ⬜ Not started | C1–C6 | ⬜ | ⬜ |
| 2 | Core Interaction Fixes | ⬜ Not started | H2–H7, H9–H12 | ⬜ | ⬜ |
| 3 | Mobile & Navigation | ⬜ Not started | C2, H1, M1, M7, M33, L4 | ⬜ | ⬜ |
| 4 | Dead & Misleading Features | ⬜ Not started | H3, M2, M3, M34, M24, M27b, L5 | ⬜ | ⬜ |
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

## Phase 1 — Critical Fixes 🔴
**Purpose:** Unblock the broken core tasks.

- [ ] **C1** Move `window.location.href` out of render in `ListingClient.tsx:250` (use `useEffect`/`useState` or `usePathname`) → SSR crash gone, `dev.log` clean
- [ ] **C2** Add bottom padding so MobileNav clears chat composer: `messages/[id]/page.tsx` + `pb-16 md:pb-0` pattern in `layout.tsx`; also fix general content overlap
- [ ] **C3** Wire report trigger on listing detail: add flag button → `setReportModal(true)` (`ListingClient.tsx`)
- [ ] **C4** Profile "Message" creates/opens conversation with that user (use existing conversation API or add a `?user=` start-conversation path), not just `/messages`
- [ ] **C5** `ReportModal.tsx`: only `setSubmitted(true)` when `res.ok`; show error toast otherwise
- [ ] **C6** Email delivery: verify Resend config/env; if unverifiable, relax `emailVerified` gate on `POST /api/listings` with clear TODO (product decision: prefer fixing Resend)

**Exit criteria:** Listing detail SSR-clean; report reachable + honest; profile message works; mobile chat usable; QA 50/50; build passes.

---

## Phase 2 — Core Interaction Fixes 🟠
**Purpose:** Make existing interactions actually work.

- [ ] **H2** Pass `onToggleFavorite` into ProductCard on: `search/page.tsx`, `favorites/page.tsx`, `profile/[id]/page.tsx`, `buyer/dashboard/page.tsx`; guests get login toast
- [ ] **H5** Fix offer status mapping: `offers/page.tsx` map `Declined → red`, remove dead `Rejected/Countered` branches
- [ ] **H6** Fix profile report: pass real listing/report target or add user-report endpoint (`profile/[id]:700`)
- [ ] **H7** Seller dashboard: server-side stats endpoint (aggregate in API) + CSV export uses full listing set, not `.slice(0,5)`
- [ ] **H9** Add `/listing/[slug]/edit` to middleware `protectedPaths` + matcher; add ownership/role check in edit page and `PUT` handler
- [ ] **H10** Unify Sell gating: guard `/sell` page (role + verification pre-flight), hide Sell in MobileNav for buyers or show same rule as Navbar, add pre-flight checks at step 1 instead of final submit
- [ ] **H12** Make "Remove image" visible without hover (`opacity-100 md:opacity-0 md:group-hover:opacity-100`) in `sell/page.tsx`, `edit/page.tsx`
- [ ] **H4** Confirmation dialog for bulk delete in `my-listings` (use existing `Modal`, not native `confirm`)

**Exit criteria:** Favorite toggles everywhere; offers show correct colors; edit route guarded; sell fails fast not late; QA 50/50.

---

## Phase 3 — Mobile & Navigation 📱
**Purpose:** Full usability on phones.

- [ ] **H1** Mobile drawer/tabs for admin, seller, buyer layouts (reuse Navbar hamburger pattern or a collapsible top bar)
- [ ] **C2 continued** Verify chat composer, bottom CTAs, footer clear the bottom nav on all pages; add global `pb-16 md:pb-0` where needed
- [ ] **M1** Consolidate mobile nav: one system — bottom nav = primary actions, hamburger = secondary links; align link sets
- [ ] **M33** Surface search in mobile top bar (tap → focused search screen/expand) instead of hamburger-only
- [ ] **M7** Mobile search: filters behind a "Filters" button/sheet; results first
- [ ] **L4** Define `safe-area-bottom` (env(safe-area-inset-bottom)) or remove class
- [ ] **M16** Admin tables: horizontal scroll wrapper (`overflow-x-auto`) on mobile

**Exit criteria:** Every authenticated page navigable on a 375px viewport; no overlap with bottom nav; search reachable in ≤2 taps.

---

## Phase 4 — Dead & Misleading Features 🧹
**Purpose:** Remove lies and dead ends.

- [ ] **M2/M3** i18n decision: **remove** Globe toggle + `I18nProvider` dead dictionary (recommended — zero call sites), or wire up `t()` on landing + nav (bigger scope). Default: remove.
- [ ] **M3** Keep theme toggle available to guests (move out of `user ?` block)
- [ ] **M34** Dev-gate `/admin/testing`: hide sidebar link unless `NODE_ENV !== 'production'` (+ middleware block)
- [ ] **H3** Related Items: pass `relatedListings` (same category, exclude current) from `listing/[slug]/page.tsx`
- [ ] **M24** Fix sell preview card dead link (`/listing/preview`) — render non-link preview
- [ ] **M27b** Buyer dashboard: remove fabricated "Browsing: Active"; rename "Recommended" → "Latest on BAI & SIL" or compute real recommendations
- [ ] **L5** Footer: de-dupe `/categories`, add Help/Contact/About or Safety/Report; fix social URLs (remove if placeholder)
- [ ] **M31** UXTestingMode: label hardcoded results as static or remove "Re-analyze" (dev-only, low priority)

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
