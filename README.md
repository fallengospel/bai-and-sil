# BAI & SIL

> **Find stuff. Sell stuff. Repeat.**

The marketplace where good finds meet good deals. Browse, buy, or sell your pre-loved treasures — all in one place.

![Next.js](https://img.shields.io/badge/Next.js-13-black)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)

---

## Table of Contents

- [Repository Branches](#repository-branches)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Test Accounts](#test-accounts)
- [Deployment](#deployment)
- [QA Testing](#qa-testing)

---

## Repository Branches

| Branch | Purpose | URL | Status |
|--------|---------|-----|--------|
| `main` | Production — stable, tested, deployed | [bai-and-sil.vercel.app](https://bai-and-sil.vercel.app) | Live |
| `staging` | Pre-production — QA testing before main | Same Vercel preview | Ready |
| `testing` | Development — active feature work | Local dev only | Active |

### Branch Workflow

```
testing → staging → main
  ↑         ↑         ↑
  │         │         └── Production (auto-deployed to Vercel)
  │         └── QA testing & review
  └── Active development
```

- **Push to `testing`** — for new features and bug fixes
- **Push to `staging`** — for QA review before production
- **Push to `main`** — production only, after testing passes

---

## Features

### Browse & Search
- **Home Page** — Fresh Drops section with latest listings
- **Categories** — 12 categories: Electronics, Fashion, Home & Living, Vehicles, Beauty, Sports, Gaming, Collectibles, Appliances, Tools, Books, Other
- **Search** — Search by title and description (case-insensitive)
- **Filters** — Filter by category, price range, condition, and location
- **Sort** — Sort by newest, price low-to-high, or price high-to-low

### Product Listings
- **Product Cards** — Image, title, price, location, seller info, condition badge
- **Product Detail** — Full description, image gallery, seller profile, similar items
- **Favorites** — Save listings to your favorites (heart icon)

### Seller Features
- **Sell Page** — 3-step listing creation wizard
  - Step 1: Title, description, condition, category
  - Step 2: Price, location
  - Step 3: Upload images, review, publish
- **Edit Listing** — Update your listings anytime
- **Delete Listing** — Remove your listings
- **Daily Limit** — 20 listings per day

### Buyer Features
- **Message Seller** — Start a conversation from any listing
- **Make Offer** — Send price offers to sellers
- **Favorites** — Save and manage your favorite items

### Messaging
- **Conversations** — Real-time messaging between buyers and sellers
- **Unread Count** — Badge showing unread messages
- **Message History** — Full conversation threads

### User Accounts
- **Registration** — Create account with email/password
- **Login** — JWT-based authentication
- **Profile** — View user profiles, ratings, and listings
- **Avatar** — Upload profile picture

### Admin Dashboard
- **Dashboard** — Platform stats and overview
- **User Management** — View, ban/unban users
- **Listing Management** — Review, delete listings
- **Reports** — Handle reported content

### Legal & Safety
- **Terms of Service** — Platform terms
- **Privacy Policy** — Data handling practices
- **Safety Tips** — Safe trading guidelines

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 13 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS, react-icons |
| Backend | Next.js API Routes, Prisma ORM |
| Database | Neon PostgreSQL (serverless) |
| Auth | JWT cookies (jose), bcryptjs |
| Images | Pexels CDN (external URLs) |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18.16.1 or higher
- npm or yarn
- Neon PostgreSQL account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/fallengospel/bai-and-sil.git
cd bai-and-sil
```

### 2. Switch to your desired branch

```bash
# For development
git checkout testing

# For QA testing
git checkout staging

# For production
git checkout main
```

### 3. Install dependencies

```bash
npm install
```

### 4. Set up environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-YOUR-ENDPOINT.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
UPLOAD_DIR="./public/uploads"
```

### 5. Push database schema

```bash
npx prisma db push
```

### 6. Seed the database

```bash
npx prisma db seed
```

### 7. Start development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
bai-and-sil/
├── prisma/
│   ├── schema.prisma        # Database schema (12 models)
│   └── seed.js               # Seed data (240+ listings)
├── public/
│   └── images/products/      # Product images
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login, Register, Forgot Password
│   │   ├── (main)/           # Categories, Search, Sell, Messages, etc.
│   │   ├── (legal)/          # Terms, Privacy, Safety
│   │   ├── admin/            # Admin dashboard
│   │   ├── api/              # API routes (8 route groups)
│   │   ├── page.tsx          # Home page
│   │   ├── layout.tsx        # Root layout
│   │   ├── not-found.tsx     # 404 page
│   │   ├── sitemap.ts        # Dynamic sitemap
│   │   └── robots.ts         # Robots.txt
│   ├── components/
│   │   ├── layout/           # Navbar, Footer, MobileNav
│   │   └── ui/               # 16 reusable UI components
│   └── lib/
│       ├── prisma.ts         # Prisma client singleton
│       ├── auth.ts           # JWT authentication
│       └── helpers.ts        # Utilities (formatPrice, slugify, etc.)
├── vercel.json               # Vercel deployment config
└── package.json
```

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | Logout (clear session) |
| POST | `/api/auth/register` | Create new account |
| GET | `/api/auth/me` | Get current user |

### Listings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/listings` | List all active listings |
| GET | `/api/listings?category=electronics` | Filter by category |
| GET | `/api/listings?q=keyword` | Search by keyword |
| GET | `/api/listings?minPrice=1000&maxPrice=50000` | Filter by price |
| GET | `/api/listings?sort=price_asc` | Sort by price |
| POST | `/api/listings` | Create new listing (auth required) |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories with counts |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/[id]` | Get user profile |

### Conversations & Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | List user conversations |
| POST | `/api/conversations` | Start new conversation |

### Favorites
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/listings/[id]/favorite` | Toggle favorite |

---

## Test Accounts

All passwords: `password123`

| Email | Role | Description |
|-------|------|-------------|
| `admin@baiandsil.ph` | Admin | Full platform access |
| `seller@baiandsil.ph` | Seller | Can create/edit/delete listings |
| `buyer@baiandsil.ph` | Buyer | Can browse, favorite, message |

---

## Deployment

### Vercel (Production)

1. Push to `main` branch
2. Vercel auto-deploys
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL` — Neon connection string
   - `NEXTAUTH_SECRET` — JWT secret key

### Branch Deployments

| Branch | Vercel Behavior |
|--------|----------------|
| `main` | Production deployment |
| `staging` | Preview deployment |
| `testing` | No auto-deploy (local only) |

---

## QA Testing

### Run Automated Tests

```bash
# Start dev server first
npm run dev

# In another terminal
node scripts/qa-test.js
```

### Test Coverage (50 tests)

| Category | Tests | Description |
|----------|-------|-------------|
| Public Pages | 10 | Home, categories, search, legal pages, 404 |
| Listings API | 8 | CRUD, filtering, sorting, pagination |
| Categories API | 2 | All 12 categories with counts |
| Authentication | 6 | Login, logout, session, role-based access |
| Search | 4 | Keyword search, case-insensitive |
| Product Detail | 5 | Slug pages, not-found handling |
| Images | 3 | Pexels URLs, image rendering |
| Category Filtering | 12 | All 12 category filters |

---

## Seed Data

The database is pre-seeded with:

- **12 categories** — Electronics to Other
- **240 listings** — 20 per category
- **3 test accounts** — Admin, Seller, Buyer
- **Real Pexels images** — 240 product photos from Pexels CDN

### Seed Commands

```bash
# Re-seed everything
npx prisma db seed

# Check listing counts
node scripts/check-counts.js
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

---

## License

Private project — All rights reserved.

---

**BAI & SIL** — Built with love for the Filipino marketplace.
