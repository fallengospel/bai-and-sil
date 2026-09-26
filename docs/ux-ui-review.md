# BAI & SIL — UX/UI Review

**Date:** 2026-09-25
**Scope:** Full audit of existing features — UX/UI side only. This document is reusable for future review rounds: check off items as they are fixed, and re-run the review to add new findings.

**Severity legend:** 🔴 Critical (blocks a core task) · 🟠 High (degrades a core task / dead feature) · 🟡 Medium (confusion / inconsistency / friction) · 🟢 Low (polish / a11y nit)

---

## 1. Feature Overview

### 1.1 Public pages
| Route | Purpose |
|---|---|
| `/` | Marketing landing (hero, features, how-it-works, categories, CTAs) |
| `/search` | Search + filters (category, location, condition, price, sort) + load-more |
| `/categories` | Category grid with live counts |
| `/listing/[slug]` | Listing detail: gallery, price, seller card, reviews |
| `/profile/[id]` | Public profile (Overview / Listings / Favorites / Reviews tabs) |
| `/terms`, `/privacy`, `/safety` | Legal pages (only pages with page-level metadata) |
| `/login`, `/register`, `/register/google`, `/forgot-password`, `/reset-password`, `/verify-email` | Auth flows |
| `404`, error boundary, global loading | Shell states |

### 1.2 Authenticated pages
| Route | Purpose |
|---|---|
| `/sell` | 3-step listing wizard (Photos → Details → Preview) |
| `/listing/[slug]/edit` | Edit listing |
| `/messages`, `/messages/[id]` | Inbox + chat thread (quick prompts, offers, 5s polling) |
| `/favorites` | Saved items |
| `/notifications` | Notification feed + push subscribe |
| `/offers` | Sent / Received offer tabs |
| `/my-listings` | Seller listing manager + bulk actions |
| `/seller/dashboard` | Stats, analytics, quick actions, CSV export |
| `/buyer/dashboard` | Stats, quick actions, saved items, "recommended" |

### 1.3 Admin pages
`/admin` (KPIs), `/admin/users`, `/admin/listings`, `/admin/reports`, `/admin/testing` (QA/dev runner)

### 1.4 Navigation
- **Navbar** (desktop): Logo, Categories, search bar, Sell/Admin CTA, messages icon, bell + unread badge (60s poll), theme toggle, language toggle, profile dropdown (Profile, Dashboard, Messages, Offers, My Listings, Logout).
- **Mobile:** Navbar hamburger panel **and** a fixed bottom `MobileNav` (Home, Explore, Sell FAB, Messages, Profile) — two competing systems.
- **Role sidebars** (admin/seller/buyer): `hidden md:block`, no mobile fallback.
- **Footer:** 4 columns — brand/social, Marketplace, Support, Legal.

---

## 2. What Works Well (keep these)

- **OTP verification flow** — auto-advance, paste support, auto-submit, resend cooldown, inline errors. Best-executed flow in the app.
- **Sell wizard** — clear 3-step indicator; image upload validates type, size (5MB) AND min dimensions (200×200) with per-file toasts.
- **ProductCard** hover affordance (lift + shadow + image scale) and sold-state treatment.
- **Empty states in main app** — shared `EmptyState` component with contextual CTAs and personality copy.
- **Tab labels with counts** (`Listings (12)`) across profile / my-listings / offers.
- **Quick-prompt chips** in chat reduce first-message friction.
- **Global `:focus-visible` outline** in `globals.css`.
- **Shared component system** (`Button`, `Badge`, `Avatar`, `EmptyState`, `LoadingSpinner`, `ProductCard`) keeps the main app coherent.
- **Color semantics are stable:** blue = primary/buyer, yellow = sell/seller, coral = danger, red = admin.
- **Typography:** Gabarito (display) + Hanken Grotesk (body) via `next/font`.
- **Button `loading` state** prevents double-submit.

---

## 3. Critical Issues 🔴

| ID | Issue | Location |
|---|---|---|
| C1 | **Listing detail crashes SSR** — `window.location.href` used during render; repeated `ReferenceError: window is not defined` in `dev.log`. Core conversion page. | `src/app/(main)/listing/[slug]/ListingClient.tsx:250` |
| C2 | **Chat composer hidden behind fixed MobileNav on mobile** — input + Send are underneath; no `pb-*` compensation anywhere. | `messages/[id]/page.tsx:202` + `layout.tsx:73-75` + `MobileNav.tsx:20` |
| C3 | **Report on a listing is unreachable** — `reportModal` state declared, `<ReportModal>` rendered, nothing ever sets it true; `FiFlag` imported but never rendered. | `ListingClient.tsx:72, 441` |
| C4 | **Profile "Message" button doesn't start a conversation** — just `router.push("/messages")`. | `profile/[id]/page.tsx:169-175` |
| C5 | **ReportModal shows false success** — `setSubmitted(true)` runs even on 401/404/409. Trust & safety signal is a lie. | `ReportModal.tsx:41` |
| C6 | **Verification emails failing** while `emailVerified` gates listing creation — new users may never get a code → cannot sell. | `dev.log`; `api/listings/route.ts:94-99` |

---

## 4. High Issues 🟠

| ID | Issue | Location |
|---|---|---|
| H1 | **No mobile navigation for Admin / Seller / Buyer dashboards** — sidebars are `hidden md:block`, no drawer. | `admin/layout.tsx:38`, `seller/layout.tsx:40`, `buyer/layout.tsx:40` |
| H2 | **Heart/favorite is a no-op on Search, Favorites, Profile, Buyer Dashboard** — `onToggleFavorite` never passed; users cannot un-save from `/favorites`. | `ProductCard.tsx:164-169`; call sites don't pass prop |
| H3 | **"Related Items" never renders** — `relatedListings` defaults `[]`, never passed from page. | `ListingClient.tsx:56,66,448` |
| H4 | **Bulk delete of listings with no confirmation** — multi-select + Apply deletes irreversibly. | `my-listings/page.tsx:93-104, 185` |
| H5 | **Declined offers render gray, not red** — API allows `Accepted\|Declined`, UI maps `Rejected`/`Countered` (mismatch). | `offers/page.tsx:79-87` vs `api/listings/[id]/offers/[offerId]/route.ts:13` |
| H6 | **Report from profile submits `listingId=""`** → request to `/api/listings//report`. | `profile/[id]/page.tsx:700` |
| H7 | **Seller dashboard metrics wrong by construction** — stats from first 50 *global* listings, client-filtered; CSV export silently exports only 5 rows. | `seller/dashboard/page.tsx:61-67, 78, 101` |
| H8 | **Dark mode non-functional** — only 9 `dark:` usages app-wide; `ThemeProvider`/`I18nProvider` remount entire tree on mount (flash + effects run twice). | `ThemeProvider.tsx:36-42`, `I18nProvider.tsx:216-222` |
| H9 | **`/listing/[slug]/edit` not in middleware `protectedPaths`, no ownership check** — any visitor can open the edit form. | `middleware.ts:116,144-157` |
| H10 | **Contradictory Sell entry points** — Navbar hides Sell from buyers, MobileNav shows it to everyone, `/sell` unguarded, API rejects only at the end. | `Navbar.tsx:165`, `MobileNav.tsx:11`, `api/listings/route.ts:94-99` |
| H11 | **Silent failure pattern** — `sendMessage`, `handleSendOffer`, search `fetchListings`, `markAllRead`, `handleSaveProfile`, all admin mutations ignore `!res.ok` → no feedback, optimistic UI applied on failure. | multiple |
| H12 | **Hover-only affordances dead on touch** — "Remove image" is `opacity-0 group-hover:opacity-100` in Sell/Edit. | `sell/page.tsx:225`, `edit/page.tsx:231` |

---

## 5. Medium Issues 🟡

### Navigation & IA
- **M1** Two competing mobile nav systems (hamburger panel vs bottom nav) with different link sets.
- **M4** Same marketing landing for guests and returning users — no discovery feed / listings above the fold.
- **M5** Landing hardcodes 6 category slugs that may not exist in DB → potential dead links. (`LandingPage.tsx:32-39`)
- **M33** Navbar search hidden behind hamburger on mobile (2 taps to search); guests lose theme/language affordances.

### Search & Marketplace
- **M6** Two sort controls (sidebar + results header) with mixed apply/auto-apply semantics. (`search/page.tsx:146-157, 188-255`)
- **M7** Mobile: filter panel stacks above results — long scroll before any item.
- **M8** Location filter: ~50 cities in one flat ungrouped `<select>`. (`lib/helpers.ts:51-65`)
- **M24** Sell preview card links to `/listing/preview` (dead link). (`sell/page.tsx:150-161`)
- **M30** `viewCount` incremented on every GET including edit page's own fetch → inflated metrics. (`api/listings/[id]/route.ts:26-29`)

### Messaging
- **M9** Offers page is read-only — no accept/decline, no link to the conversation. (`offers/page.tsx:127-171`)
- **M10** Offers render out of chronological order relative to messages.
- **M11** Quick prompts send instantly, no undo.
- **M32** 5s chat + 60s notification polling never pauses for background tabs.

### Profile & Notifications
- **M12** Notifications never mark read on click; no auto-refresh; only "Mark all read".
- **M20** Public viewers see a permanently-empty Favorites tab (implies a privacy boundary that isn't there).
- **M21** Phone numbers publicly exposed with no privacy toggle. (`profile/[id]:478-482`)
- **M22** Profile loads 50 global listings to show one user's items, filters client-side.
- **M16** Profile save silently fails (no `!res.ok` branch). (`profile:156-161`)
- **M27** "Member for {n} days" awkward copy.

### Forms, Drafts, State
- **M23** No draft persistence in Sell (3 steps), Edit, or Register — refresh/Back loses everything.
- **M25** Only one global `loading.tsx`/`error.tsx` — no nested route boundaries, no `global-error.tsx`.
- **M31** `UXTestingMode` presents hardcoded findings as live analysis (dev-only but misleading).

### Dashboards & Admin
- **M15** Native `confirm()` for destructive actions in 4 places, inconsistent with `Modal`.
- **M17** Role sidebars not sticky; active state only matches exact `/admin` (nested pages lose highlight).
- **M26** Empty states inconsistent — shared `EmptyState` in main app, raw text in admin.
- **M27b** Buyer dashboard fabricated stats: "Browsing: Active" (not data); "Recommended" = first 8 global listings.
- **Admin:** no pagination; non-atomic mutations with no error handling; tables clipped on mobile (`overflow-hidden` + `w-full`).

### Dead / Misleading Code
- **M2 i18n entirely dead** — 100+ EN/Fil strings, `t()` never called; globe toggle changes nothing visible. (`I18nProvider.tsx`, only `Navbar.tsx:10,25`)
- **M3** Theme/language toggles only rendered for logged-in users.
- **M34** `/admin/testing` ships in production admin nav (not dev-gated) and executes real API calls from the browser.
- **M28** Condition→color mapping duplicated in 3 places with divergent logic. (`ProductCard.tsx:50-67`, `ListingClient.tsx:263-275`, `Badge.tsx:17-25`)
- **Logout failure only `console.error`** — no user feedback.

---

## 6. Low Issues 🟢

- **L1** Two competing brand blues: token `bai-blue #023E8A` vs hardcoded `#0F3D91`/`#101B3A` (landing + `globals.css` buttons).
- **L2** Border-radius chaos: `rounded-lg` (Button), `rounded-2xl` (cards/nav/inputs), `rounded-3xl` (`.card`), `rounded-xl` (Modal), `rounded-full` (admin badges).
- **L3** Button variants double-apply conflicting classes (`btn-primary bg-bai-blue` — two blues in one class list).
- **L4** `safe-area-bottom` referenced in MobileNav but never defined → iPhone home-indicator overlap.
- **L5** Footer duplicates `/categories` in two columns; social links point to bare `facebook.com` etc.; no Help/Contact/About.
- **L6** OTP inputs lack `autocomplete="one-time-code"`, `aria-label`, `name`.
- **L7** Icon-only buttons without labels (hamburger, theme, language, gallery zoom, back, modal close).
- **L8** `alt=""` on content images.
- **L9** Zero `aria-live` regions — inline errors, toasts, counters not announced.
- **L10** Copy inconsistencies: mixed EN/TL, empty-category joke copy, casual error copy.
- **L11** Touch targets under 44px (card heart `p-1.5` ≈ 24px).
- **L13** No `prefers-reduced-motion` handling for `float`, `wiggle`, `pulse-ring`, `count-up` animations.
- **L14** Toasts always top-right — can obscure sticky Navbar; no explicit aria config.

---

## 7. Loading / Empty / Error States

**Loading — mixed quality:**
- ✅ `LoadingSpinner` + contextual text in search, messages, offers, favorites, my-listings, notifications.
- ✅ Global `loading.tsx` ("Bai is looking...") — but only at root, none nested.
- ⚠ Raw `animate-spin` divs in 9 places (admin/seller/buyer layouts + dashboards) bypass the shared component; some `h-screen` (full-page blank).
- ⚠ Skeletons exist only on the edit page — nowhere else.
- ⚠ Infinite spinner risks: `/messages` inbox fetch gated on `currentUserId` (never resolves if `/api/auth/me` fails); `/profile/me` spinner-then-redirect with no escape.
- ⚠ Providers remount whole tree on mount → every effect runs twice, data fetched twice, visible flash.

**Empty states:** strong in main app, absent in admin (raw `"No reports."` text), buyer dashboard favorites section silently hidden, `EmptyState.action` only supports a `Link` (no button/callback).

**Error handling — weakest area:**
- Pervasive `catch {}` / `catch { /* ignore */ }`.
- `!res.ok` ignored in sendMessage, offers, profile save, all admin mutations → optimistic UI applied even when server rejected.
- Field-level validation UI exists (`Input.error` prop) but is never passed by any form — toasts only; server `errors` objects dropped.
- 429 rate-limit shown as generic message — no countdown/retry.
- No offline handling, no retry buttons, no request timeouts.

---

## 8. Mobile / Responsive

**Works:** breakpoint discipline, grid degradation, navbar collapse, bottom nav with raised Sell FAB, profile stacking, landing hero illustration hidden below `lg`.

**Broken:**
1. Fixed bottom nav overlaps content on every page (no `pb-*` on `<main>`/`<footer>`).
2. Chat composer completely blocked (C2).
3. Role dashboards have zero navigation below `md` (H1).
4. Admin tables clipped (no horizontal scroll).
5. `safe-area-bottom` undefined (L4).
6. Search filters stack above results.
7. Hover-only states dead on touch (H12).
8. 2 taps to reach search.
9. 2-col grid at 320px → ~150px cards, likely cramped.
10. Seller dashboard 6-across stat row at `lg` → very narrow cards.
11. No touch affordances (no gallery swipe, no pull-to-refresh).

---

## 9. Accessibility (below WCAG 2.1 AA)

| Area | Finding | Sev |
|---|---|---|
| Form labels | `Input`/`Select`/`TextArea` render `<label>` without `htmlFor`/`id` — every form in the app | High |
| Modal | No `role="dialog"`, `aria-modal`, focus trap, initial focus; close button unlabeled | High |
| Icon buttons | No accessible names (only one `aria-` in all of `src/components/ui`) | High |
| Keyboard | Dropzone and gallery zoom are `<div onClick>` — not focusable; tabs not ARIA tabs | High |
| Color contrast | Risk: `text-white` on yellow Sell button; `text-gray-400` on white timestamps | High |
| Skip link | None — must tab through entire Navbar every page | Medium |
| Live regions | Zero `aria-live` in app code | Medium |
| Focus visibility | Global `:focus-visible` ✅ but `Button` sets `focus:outline-none`; ghost ring low-contrast | Medium |
| Nested interactives | `<Link>` wrapping `<Button>` in ≥5 places — invalid HTML | Medium |
| Tables | No `<caption>`, `scope`, `aria-sort`, pagination semantics | Medium |
| Motion | No `prefers-reduced-motion` guard | Medium |
| SEO | No `generateMetadata` for listing detail (highest-value page); `metadataBase` unset warning | Medium |

---

## 10. Visual Design Consistency

**Consistent (keep):** rounded-2xl/3xl card recipe with `shadow-cartoon`, stable color role semantics, Feather icons (`react-icons/fi`), Gabarito + Hanken Grotesk, shared components in `(main)`, custom scrollbar + `::selection`.

**Drifting:**
- Two blue systems coexist (token `bai-blue` vs hardcoded `#0F3D91` on landing + buttons).
- Raw Tailwind colors (`green-600`, `purple-500`…) mixed with tokens; 6 different gradient tiles for 6 seller KPIs — color carries no meaning.
- Five radii for one product (L2); Button double-definition (L3).
- KPI card markup copy-pasted (6× seller, 4× admin, 3× buyer) — no shared `StatCard`.
- Admin looks like a different product (plain tables, `rounded-full` badges, no token headings).
- Three loading-spinner aesthetics.
- Landing (hardcoded categories) vs Navbar (one link) vs Footer (different set) IA mismatch.
- `--font-brand` referenced in Tailwind config but never defined.
- Dark mode tokens exist but 9 usages (H8).

---

## 11. Suggested Remediation Priority

1. **C1** — Fix `window.location.href` in `ListingClient.tsx` (move into `useEffect` or use `usePathname`).
2. **C2 + mobile overlap** — Add bottom padding for `MobileNav`; verify chat composer clears it; give role dashboards a mobile drawer (H1).
3. **C3/C5/H6** — Wire up report trigger, fix ReportModal success check (`res.ok`), fix profile report ID.
4. **H2** — Pass `onToggleFavorite` from Search/Favorites/Profile/Buyer Dashboard.
5. **H11** — Audit all `!res.ok` / `catch {}` sites; add toasts + stop optimistic updates on failure.
6. **C6** — Fix email delivery or relax the `emailVerified` gate until Resend domain is verified.
7. **H5/H9/H10/M34** — Offer status mapping, edit-route middleware guard + ownership check, Sell guard consistency, dev-gate `/admin/testing`.
8. **M2/i18n** — Either wire up `t()` or remove the toggle and dead dictionary.
9. **A11y quick wins** — `htmlFor`/`id` on form primitives, `role="dialog"` + focus trap in Modal, `aria-label` on icon buttons, `autocomplete="one-time-code"` on OTP.
10. **Consolidate** — Single radius scale, single blue, shared `StatCard`, replace native `confirm()` with `Modal`, consistent empty states in admin.

---

## Review Checklist (for future rounds)

- [ ] All 🔴 Critical items resolved
- [ ] All 🟠 High items resolved
- [ ] 🟡 Medium triaged — fixed or explicitly accepted
- [ ] A11y quick wins (form labels, modal roles, icon labels) done
- [ ] Re-run `scripts/qa-test.js` (50/50) and `/admin/testing` after fixes
- [ ] Re-audit and append new findings below

### Change log
| Date | Reviewer | Findings added / resolved |
|---|---|---|
| 2026-09-25 | opencode | Initial audit: 6 critical, 12 high, ~34 medium, ~14 low |
| 2026-09-25 | opencode | Resolved C1–C6 (Phase 1, deployed to main) |
