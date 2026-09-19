# BAI & SIL Landing Page Redesign Plan

## Design Principles

1. **Show the product, don't just describe it.** The hero demonstrates browsing, chatting, and dealing — the core loop.
2. **Filipino palengke visual language.** Hand-lettered price tags, hang-tags on string, tarpaulin energy, rubber stamps. Not Silicon Valley SaaS.
3. **Spend boldness in one place: the hero.** Everything else is calm, consistent, disciplined.
4. **One voice.** Friendly Taglish. Sentence case. Active verbs. No filler.
5. **Earn the claims.** Soften trust language to match a meet-up-and-pay-cash model.

---

## Palette

| Token | Hex | Role |
|-------|-----|------|
| ink | `#101B3A` | Primary text, strong outlines (not pure black) |
| jeepney-blue | `#0F3D91` | Primary actions, headings on light, hero bg |
| sun-yellow | `#FFC72C` | Price tags, highlights, stamps, accents |
| tomato | `#E63B2E` | SOLD stamp, urgency, one accent only |
| mist | `#EAF0FB` | Panel/section backgrounds |
| paper | `#FFFFFF` | Page background, cards |

**Relationship to existing brand:** The logo's navy `#0A2E6E` maps closely to jeepney-blue `#0F3D91`. The logo gold `#F5BD5D` maps to sun-yellow `#FFC72C`. Existing `sil-yellow` and `bai-blue` tokens stay for backward compatibility.

---

## Typography

| Role | Font | Justification |
|------|------|---------------|
| Display | **Gabarito** | Chunky, rounded, sign-painter energy. Strong peso sign glyph. Google Fonts. Weights 400-900. |
| Body | **Hanken Grotesk** | Clean, friendly, very readable. Pairs well with Gabarito. Good peso rendering. Weights 300-800. |

Loaded via `next/font/google`. Replaces Space Grotesk and Inter as primary.

**Type scale:**
- display-hero: 3.5rem / 1.1 / 900
- display-lg: 2.5rem / 1.2 / 800
- heading-1: 2rem / 1.25 / 700
- heading-2: 1.5rem / 1.3 / 700
- heading-3: 1.25rem / 1.4 / 600
- body-lg: 1.125rem / 1.6 / 400
- body: 1rem / 1.5 / 400
- body-sm: 0.875rem / 1.5 / 400
- caption: 0.75rem / 1.4 / 500

---

## Layout Wireframes

### Desktop (>=1024px)

```
+----------------------------------------------------------------------+
| logo    Categories    [search........................]    Magbenta   |
+----------------------------------------------------------------------+
|                                        +--------+ +--------+        |
|  Hanap, Benta,                          | phone  | | sneaker|        |
|  I-repeat!                              | P11.5k | | P1,800 |        |
|                                         +--------+ \+--------+       |
|  Ang marketplace na gawa ng Pinas.           [chat bubbles]         |
|  Mag-browse, magbenta, mag-deal.         +--------+  SOLD (stamp)   |
|                                          | fan    |                  |
|  [search bar        Hanapin]             +--------+                  |
|  Electronics | Fashion | Gaming...                                  |
|  Libreng mag-list, direct chat, meet-up sa public place.            |
+----------------------------------------------------------------------+
```

### Mobile (<=640px)

```
+----------------------------------+
| logo                     [menu] |
+----------------------------------+
| Hanap, Benta,                    |
| I-repeat!                        |
|                                  |
| [search bar     Hanapin]         |
| Electronics Fashion Gaming...    |
|                                  |
| [  phone P11.5k  ] [sneaker]    |
| [  chat bubbles  ] [SOLD stamp] |
|                                  |
| Libreng mag-list, direct chat,   |
| meet-up sa public place.         |
+----------------------------------+
```

---

## Section-by-Section Plan

### Hero ("The deal in four beats")
- Left: headline + subcopy + search bar + category chips + seller nudge + trust line
- Right: overlapping cluster of 3-4 listing cards with flat SVG illustrations, Messenger chat panel, SOLD stamp
- Animation: 8-10s loop (cards deal in, chat lines appear, SOLD stamps, new card slides in). CSS keyframes only.
- `prefers-reduced-motion`: static final frame. IntersectionObserver pauses when off-screen.
- `aria-hidden="true"` on visual. Headline/search/CTAs carry all meaning.
- Search bar submits to `/search?q=...`. Category chips link to `/search?category=<slug>`.
- Remove stats from hero. Show real counts in a slim strip below if available.

### Header
- Sticky, compact. Logo left, search center on desktop (hidden on homepage while hero search is in view via IntersectionObserver), "Magbenta" as filled button, login/profile right.
- Mobile: keep existing bottom nav. Make Sell the visually distinct center action.

### Features ("Bakit BAI & SIL?")
- Drop four identical cards. Use asymmetric layout: one large panel showing a static Direct Chat mock, and a compact list for the other three. Different radii/shadows per card.
- No eyebrow label.

### How It Works ("Paano Gamitin?")
- Keep 1-2-3 sequence with connecting path/line. Small illustrations matching hero style.

### Categories
- Replace emoji with consistent custom SVG icons. Varied tile sizes (2 larger + 4 smaller).
- Show item counts only if real (from API).

### Seller CTA
- Remove duplicated stats. Replace with compact listing-flow mock (photo -> title -> price -> post).
- Striped-bag accent appears here once.

### Final CTA
- "Create Account" primary, "Browse Listings" secondary. Shorter, warmer copy.

### Footer
- Remove placeholder social links, leave TODO(owner). Tighten spacing.
- Keep Marketplace / Support / Legal columns.

### Global
- Tokens: 2-3 radii, 2 shadow levels. Consistent focus-visible ring. 44x44px touch targets.
- WCAG AA contrast on all text including on sun-yellow.
- Semantic HTML: one h1, ordered headings, landmarks, buttons vs links correct.
- OG: improve title/description. Add OG image.
- Motion: only in response to user actions outside hero. No fade-and-slide-up everywhere.

### Copy Rules
- Friendly Taglish. Sentence case. Active verbs.
- Button says exactly what happens. Same term for same action throughout.
- No "Promise!" repeated. Don't invent claims/numbers/testimonials.

### Banned Patterns
- Small tracked ALL-CAPS eyebrow above every heading
- One word in different color in headlines
- Identical rounded cards with same shadow
- Gradient blobs, glow orbs, glass panels
- Emoji as icons
- Center-aligned everything
- Arrow appended to every link/button
- Entrance animations on every section

---

## Implementation Phases

### Phase 2: Hero (first)
1. Create `src/components/hero/` directory with sub-components
2. Build flat SVG product illustrations (phone, sneaker, fan, controller)
3. Build Messenger chat bubble component
4. Build SOLD rubber stamp SVG
5. Build price hang-tag SVG with string detail
6. Compose the hero visual cluster
7. Build the animated sequence with CSS keyframes
8. Implement search bar + category chips
9. Wire up `prefers-reduced-motion` and IntersectionObserver
10. Replace hero section in LandingPage.tsx

### Phase 3: Rest of UI
1. Update typography (Gabarito + Hanken Grotesk)
2. Add new palette tokens to Tailwind config
3. Redesign header (sticky, search center, Magbenta button)
4. Redesign Features section (asymmetric layout)
5. Redesign How It Works (connecting line, illustrations)
6. Redesign Categories (SVG icons, varied tiles)
7. Redesign Seller CTA (listing flow mock)
8. Redesign Final CTA
9. Clean up Footer
10. Global token cleanup

### Phase 4: Verify
- Build, type-check, lint
- Test at 390px, 768px, 1280px
- Verify animation, keyboard nav, contrast
- No console errors, no layout shift
