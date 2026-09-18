# BAI & SIL Design System

> A Filipino marketplace design system inspired by Impeccable. Modern, a little bit cartoonish but professional.

## Overview

BAI & SIL uses a design language that blends Filipino warmth with modern web aesthetics. The system prioritizes clarity, purposeful motion, and visual hierarchy while maintaining a playful, approachable character.

### Design Principles
1. **Calm by default** — Clean whitespace, breathing room, no visual noise
2. **One action per screen** — Clear visual hierarchy, primary CTA wins
3. **Purposeful motion** — Animations convey state, not decoration
4. **Bolder without chaos** — Strategic color, confident typography
5. **Filipino warmth** — Approachable, friendly, not sterile

---

## Colors

### Brand Anchors
| Token | Value | Usage |
|-------|-------|-------|
| `bai-blue` | `#023E8A` | Primary brand, CTAs, links |
| `bai-blue-dark` | `#012A62` | Dark variant, text on light |
| `bai-blue-hover` | `#0356B3` | Hover states |
| `bai-blue-light` | `#E8F4FD` | Backgrounds, subtle accents |
| `sil-yellow` | `#FFD581` | Secondary accent, highlights |
| `sil-yellow-dark` | `#FFC233` | Hover, active states |
| `sil-yellow-light` | `#FFF9E0` | Backgrounds |
| `sil-yellow-hover` | `#FFE699` | Hover states |

### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| `coral` | `#FF6B6B` | Errors, sold badges, alerts |
| `mint` | `#00D2D3` | Success, online status |
| `orange` | `#FF9F43` | Warnings, pending states |
| `emerald` | `#10B981` | Success states |

### Surfaces
| Token | Value | Usage |
|-------|-------|-------|
| `surface` | `#FFF8F0` | Page background (warm linen) |
| `surface-dark` | `#FFF5EB` | Alternate background |
| `white` | `#FFFFFF` | Cards, inputs |

---

## Typography

### Font Stack
- **Display**: Inter (800, 900 weight)
- **Body**: Inter (400, 500, 600 weight)
- **Mono**: system-ui fallback

### Type Scale
| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `hero` | 3.5rem (56px) | 900 | 1.1 | Hero headlines |
| `h1` | 2.5rem (40px) | 800 | 1.2 | Page titles |
| `h2` | 1.875rem (30px) | 700 | 1.3 | Section headers |
| `h3` | 1.25rem (20px) | 700 | 1.4 | Card titles |
| `body-lg` | 1.125rem (18px) | 400 | 1.6 | Lead paragraphs |
| `body` | 1rem (16px) | 400 | 1.5 | Default text |
| `body-sm` | 0.875rem (14px) | 400 | 1.5 | Secondary text |
| `caption` | 0.75rem (12px) | 500 | 1.4 | Labels, metadata |

---

## Spacing Scale

Based on 4px grid: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128`

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight spacing |
| `sm` | 8px | Small gaps |
| `md` | 16px | Default gaps |
| `lg` | 24px | Section gaps |
| `xl` | 32px | Component padding |
| `2xl` | 48px | Section breaks |
| `3xl` | 64px | Major sections |
| `4xl` | 96px | Hero padding |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `none` | 0 | — |
| `sm` | 8px | Inputs, small elements |
| `md` | 12px | Buttons, badges |
| `lg` | 16px | Cards |
| `xl` | 20px | Large cards, modals |
| `2xl` | 24px | Feature cards |
| `3xl` | 32px | Hero containers |
| `full` | 9999px | Pills, avatars |

---

## Elevation

| Level | Shadow | Usage |
|-------|--------|-------|
| `none` | none | Flat elements |
| `sm` | `0 1px 3px rgba(0,0,0,0.08)` | Subtle lift |
| `card` | `0 4px 16px rgba(2,62,138,0.08)` | Default cards |
| `card-hover` | `0 12px 32px rgba(2,62,138,0.15)` | Card hover |
| `cartoon` | `4px 4px 0px rgba(2,62,138,0.15)` | Playful lift |
| `cartoon-lg` | `6px 6px 0px rgba(2,62,138,0.12)` | Strong cartoon |
| `glow-blue` | `0 0 24px rgba(2,62,138,0.2)` | Blue glow |
| `glow-yellow` | `0 0 24px rgba(255,213,129,0.3)` | Yellow glow |

---

## Components

### Buttons
- **Primary**: bai-blue bg, white text, cartoon shadow, lift on hover
- **Secondary**: sil-yellow bg, dark text, cartoon shadow, lift on hover
- **Outline**: bai-blue border, blue text, fill on hover
- **Ghost**: transparent, subtle fill on hover
- **Danger**: coral bg, white text

### Cards
- White background, rounded-2xl/3xl
- Card shadow by default
- Lift + glow on hover
- Border: 1px solid gray-100

### Inputs
- White bg, rounded-2xl
- 2px border gray-200
- Focus: blue border + ring
- Error: coral border

### Badges
- Pill-shaped (rounded-full)
- Color variants: blue, yellow, green, red, gray
- Small, bold text

### Navigation
- Sticky top, glass effect
- Logo left, actions right
- Mobile: fixed bottom nav

---

## Motion

### Principles
- **Purposeful**: Every animation communicates state
- **Quick**: 150-300ms for micro-interactions
- **Smooth**: ease-out for enter, ease-in for exit
- **Consistent**: Same element, same timing

### Tokens
| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `instant` | 100ms | ease-out | Button press |
| `fast` | 150ms | ease-out | Hover states |
| `normal` | 200ms | ease-out | Transitions |
| `slow` | 300ms | ease-out | Page transitions |
| `spring` | 400ms | cubic-bezier(0.34, 1.56, 0.64, 1) | Bounce/floating |

### Animations
- `float`: translateY 0 → -8px → 0 (3s infinite)
- `wiggle`: rotate -2deg → 2deg (1s infinite)
- `pop`: scale 0.95 → 1 + fade in (0.3s)
- `fadeInUp`: opacity 0 + translateY 10px → full (0.3s)

---

## Layout

### Grid
- Max width: 1280px (7xl)
- Padding: 16px mobile, 24px tablet, 32px desktop
- Gap: 16px default, 24px sections

### Sections
- Hero: 96px vertical padding
- Content sections: 64px vertical padding
- Compact sections: 48px vertical padding
- Section breaks: 48px between sections

---

## Do's and Don'ts

### Do
- Use cartoon shadows for playful elements
- Keep one primary CTA per section
- Use yellow strategically for highlights
- Maintain breathing room between elements
- Use Filipino language for warmth
- Keep animations purposeful

### Don't
- Use italic serif fonts (AI slop)
- Add pulsing dots everywhere
- Use gradient text excessively
- Make everything bouncy (pick moments)
- Use more than 2 accent colors per section
- Crowd elements together
