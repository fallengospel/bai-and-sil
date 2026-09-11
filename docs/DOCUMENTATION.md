# BAI & SIL — Complete Documentation

> **Version:** 1.0.0  
> **Last Updated:** September 11, 2026  
> **Status:** MVP Complete — Phase 2 Planned

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Getting Started](#3-getting-started)
4. [Architecture](#4-architecture)
5. [Database Schema](#5-database-schema)
6. [Feature Documentation](#6-feature-documentation)
7. [API Reference](#7-api-reference)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Deployment Guide](#9-deployment-guide)
10. [Testing Guide](#10-testing-guide)
11. [Troubleshooting](#11-troubleshooting)
12. [Roadmap](#12-roadmap)
13. [Contributing](#13-contributing)
14. [License](#14-license)

---

## 1. Project Overview

### 1.1 What is BAI & SIL?

BAI & SIL is a Filipino-focused online marketplace platform designed for buying and selling pre-loved items. The name combines Filipino words to represent the buyer-seller relationship. The platform enables users to browse, buy, and sell items with a focus on face-to-face meet-up transactions common in the Philippines.

### 1.2 Key Features

| Feature | Description | Status |
|---------|-------------|--------|
| Browse & Search | Search by keyword, category, price, location | ✅ Complete |
| User Registration | Role-based (Buyer/Seller/Admin) | ✅ Complete |
| Listings Management | Create, edit, delete, mark as sold | ✅ Complete |
| Messaging | Real-time buyer-seller communication | ✅ Complete |
| Favorites | Save and manage favorite items | ✅ Complete |
| Reviews & Ratings | Rate sellers after transactions | ✅ Complete |
| Offers | Make and accept/decline price offers | ✅ Complete |
| Admin Dashboard | User management, listing moderation | ✅ Complete |
| Filipino Branding | Tagalog UI, peso formatting, local UX | ✅ Complete |
| Dark Mode | Light/dark theme toggle | ✅ Complete |
| Multi-language | Filipino/English toggle | ✅ Complete |
| Price Alerts | Subscribe to price drop notifications | ✅ Complete |
| Saved Searches | Save and load search presets | ✅ Complete |
| Recently Viewed | Track browsing history | ✅ Complete |

### 1.3 Target Users

- **Buyers**: Filipinos looking to purchase pre-loved items at good prices
- **Sellers**: Individuals wanting to sell used items locally
- **Admins**: Platform operators managing the marketplace

### 1.4 Live URLs

| Environment | URL | Branch |
|-------------|-----|--------|
| Production | https://bai-and-sil.vercel.app | `main` |
| Staging | Same Vercel preview | `staging` |
| Development | http://localhost:3000 | `testing` |

---

## 2. Tech Stack

### 2.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 13.5.7 | React framework with App Router |
| React | 18.x | UI library |
| TypeScript | 5.x | Type-safe JavaScript |
| Tailwind CSS | 3.x | Utility-first CSS framework |
| react-icons | 4.x | Icon library |
| react-hot-toast | 2.x | Toast notifications |
| DiceBear | 7.x | Avatar generation |

### 2.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 13.x | API endpoints |
| Prisma | 5.22.0 | ORM for database |
| jose | 4.x | JWT authentication |
| bcryptjs | 2.x | Password hashing |
| uuid | 9.x | Unique ID generation |

### 2.3 Database

| Technology | Purpose |
|------------|---------|
| Neon PostgreSQL | Serverless PostgreSQL database |
| Prisma Migrate | Database schema management |

### 2.4 Deployment

| Technology | Purpose |
|------------|---------|
| Vercel | Hosting and deployment |
| GitHub | Version control |
| Vercel Auto Deploy | CI/CD from `main` branch |

### 2.5 Development Tools

| Tool | Purpose |
|------|---------|
| Node.js 18.16.1 | JavaScript runtime |
| npm | Package manager |
| VS Code | Code editor |
| Prisma Studio | Database GUI |

---

## 3. Getting Started

### 3.1 Prerequisites

- Node.js 18.16.1 or higher
- npm or yarn
- Neon PostgreSQL account (free tier works)
- GitHub account

### 3.2 Installation

```bash
# Clone the repository
git clone https://github.com/fallengospel/bai-and-sil.git
cd bai-and-sil

# Install dependencies
npm install
```

### 3.3 Environment Setup

Create `.env` file in the root directory:

```env
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-YOUR-ENDPOINT.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3.4 Database Setup

```bash
# Push schema to database
npx prisma db push

# Seed the database
npx prisma db seed
```

### 3.5 Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 3.6 Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@baiandsil.ph | password123 | Admin |
| seller@baiandsil.ph | password123 | Seller |
| buyer@baiandsil.ph | password123 | Buyer |

---

## 4. Architecture

### 4.1 Project Structure

```
bai-and-sil/
├── docs/                          # Documentation
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.js                    # Seed data
├── public/
│   ├── logo.svg                   # Application logo
│   ├── placeholder.svg            # Image placeholder
│   └── sw.js                      # Service worker
├── scripts/
│   ├── qa-test.js                 # Automated QA tests
│   └── update-roles.sql           # Role update SQL
├── src/
│   ├── app/
│   │   ├── (auth)/                # Authentication pages
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (main)/                # Main application pages
│   │   │   ├── categories/page.tsx
│   │   │   ├── search/page.tsx
│   │   │   ├── sell/page.tsx
│   │   │   ├── messages/page.tsx
│   │   │   ├── favorites/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   ├── profile/[id]/page.tsx
│   │   │   ├── profile/me/page.tsx
│   │   │   ├── listing/[slug]/page.tsx
│   │   │   ├── my-listings/page.tsx
│   │   │   └── offers/page.tsx
│   │   ├── (legal)/               # Legal pages
│   │   │   ├── terms/page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   └── safety/page.tsx
│   │   ├── admin/                 # Admin dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── listings/page.tsx
│   │   │   └── reports/page.tsx
│   │   ├── seller/                # Seller dashboard
│   │   │   ├── layout.tsx
│   │   │   └── dashboard/page.tsx
│   │   ├── buyer/                 # Buyer dashboard
│   │   │   ├── layout.tsx
│   │   │   └── dashboard/page.tsx
│   │   ├── api/                   # API routes
│   │   │   ├── auth/
│   │   │   ├── listings/
│   │   │   ├── categories/
│   │   │   ├── users/
│   │   │   ├── conversations/
│   │   │   ├── messages/
│   │   │   ├── reviews/
│   │   │   ├── notifications/
│   │   │   ├── price-alerts/
│   │   │   ├── searches/
│   │   │   ├── upload/
│   │   │   └── admin/
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Homepage
│   │   ├── not-found.tsx          # 404 page
│   │   ├── error.tsx              # Error boundary
│   │   ├── sitemap.ts             # Dynamic sitemap
│   │   └── robots.ts              # Robots.txt
│   ├── components/
│   │   ├── layout/                # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   └── I18nProvider.tsx
│   │   └── ui/                    # Reusable UI components
│   │       ├── AnimatedAvatar.tsx
│   │       ├── Avatar.tsx
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── CategoryCard.tsx
│   │       ├── EmptyState.tsx
│   │       ├── FileUpload.tsx
│   │       ├── Input.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── Modal.tsx
│   │       ├── ProductCard.tsx
│   │       ├── ReportModal.tsx
│   │       ├── ReviewForm.tsx
│   │       ├── SearchBar.tsx
│   │       ├── Select.tsx
│   │       ├── StarRating.tsx
│   │       └── TextArea.tsx
│   └── lib/
│       ├── prisma.ts              # Prisma client singleton
│       ├── auth.ts                # Authentication utilities
│       ├── helpers.ts             # Utility functions
│       └── recently-viewed.ts     # Recently viewed tracking
├── .env                           # Environment variables (gitignored)
├── .gitignore
├── FEATURES.md                    # Feature tracker
├── next.config.js
├── package.json
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

### 4.2 Data Flow

```
User Action → Client Component → API Route → Prisma → Database
                ↓
          Response ← JSON ← Query Result ← PostgreSQL
```

### 4.3 Authentication Flow

```
1. User submits login form
2. API validates credentials (bcrypt)
3. JWT token created (jose)
4. Token stored as httpOnly cookie
5. Session includes userId and role
6. Middleware checks JWT on protected routes
7. Role-based access in layout components
```

---

## 5. Database Schema

### 5.1 Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User      │     │   Listing   │     │  Category   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id           │◄────│ sellerId    │     │ id           │
│ name         │     │ title       │     │ name         │
│ email        │     │ slug        │     │ slug         │
│ password     │     │ description │     │ icon         │
│ avatar       │     │ price       │     └─────────────┘
│ location     │     │ categoryId  │            │
│ bio          │     │ condition   │            │
│ phone        │     │ location    │            │
│ role         │     │ status      │            │
│ isAdmin      │     │ viewCount   │            │
│ verified     │     │ createdAt   │            │
│ rating       │     │ updatedAt   │            │
│ reviewCount  │     └─────────────┘            │
│ createdAt    │            │                   │
└─────────────┘            │                   │
       │                   │                   │
       │    ┌──────────────┼───────────────────┘
       │    │              │
       ▼    ▼              ▼
┌─────────────┐     ┌─────────────┐
│  Favorite   │     │ ListingImage│
├─────────────┤     ├─────────────┤
│ userId      │     │ id          │
│ listingId   │     │ listingId   │
│ createdAt   │     │ imageUrl    │
└─────────────┘     │ sortOrder   │
                    └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│Conversation │     │   Message   │     │   Review    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ buyerId     │     │ id          │     │ reviewerId  │
│ sellerId    │     │ conversation│     │ listingId   │
│ listingId   │     │ senderId    │     │ rating      │
│ createdAt   │     │ content     │     │ comment     │
│ updatedAt   │     │ createdAt   │     │ createdAt   │
└─────────────┘     └─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Offer    │     │    Report   │     │Notification │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ listingId   │     │ reporterId  │     │ userId      │
│ buyerId     │     │ listingId   │     │ type        │
│ amount      │     │ reason      │     │ title       │
│ status      │     │ description │     │ body        │
│ message     │     │ status      │     │ read        │
│ createdAt   │     │ createdAt   │     │ data        │
└─────────────┘     └─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐
│ PriceAlert  │     │ SavedSearch │
├─────────────┤     ├─────────────┤
│ userId      │     │ userId      │
│ listingId   │     │ query       │
│ targetPrice │     │ filters     │
│ active      │     │ createdAt   │
└─────────────┘     └─────────────┘
```

### 5.2 Model Details

#### User Model
```typescript
model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  password      String
  avatar        String?
  location      String?
  bio           String?
  phone         String?
  role          String    @default("buyer")  // buyer, seller, admin
  isAdmin       Boolean   @default(false)
  verified      Boolean   @default(false)
  rating        Float     @default(0)
  reviewCount   Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  listings      Listing[]
  favorites     Favorite[]
  conversations Conversation[] @relation("BuyerConversations")
  sentMessages  Message[]
  reviews       Review[]
  reports       Report[]
  priceAlerts   PriceAlert[]
  savedSearches SavedSearch[]
}
```

#### Listing Model
```typescript
model Listing {
  id          String   @id @default(uuid())
  sellerId    String
  title       String
  slug        String   @unique
  description String
  price       Float
  categoryId  String
  condition   String   // Brand New, Like New, Good, Fair
  location    String
  status      String   @default("Active")  // Active, Sold, Reserved, Removed
  viewCount   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  seller      User            @relation(fields: [sellerId], references: [id])
  category    Category        @relation(fields: [categoryId], references: [id])
  images      ListingImage[]
  favorites   Favorite[]
  conversations Conversation[]
  offers      Offer[]
  reviews     Review[]
  reports     Report[]
  priceAlerts PriceAlert[]
}
```

---

## 6. Feature Documentation

### 6.1 Browse & Search

**Description:** Users can browse listings by category, search by keyword, filter by price/location/condition, and sort results.

**How to Use:**
1. Navigate to homepage to see latest listings
2. Click "Categories" to browse by category
3. Use search bar to find specific items
4. Apply filters on search page for refined results

**Filter Options:**
| Filter | Options |
|--------|---------|
| Category | Electronics, Fashion, Home & Living, Vehicles, Beauty, Sports, Gaming, Collectibles, Appliances, Tools, Books, Other |
| Condition | Brand New, Like New, Good, Fair |
| Price | Min/Max range |
| Location | Philippine cities |
| Sort | Newest, Price Low-High, Price High-Low |

### 6.2 User Registration

**Description:** New users can register as Buyers or Sellers.

**Registration Flow:**
1. Click "Register" in navbar
2. Enter name, email, password
3. Select role (Buyer or Seller)
4. Enter phone number (optional)
5. Select location
6. Submit registration
7. Auto-login after registration

**Role Permissions:**
| Capability | Buyer | Seller | Admin |
|------------|-------|--------|-------|
| Browse listings | ✅ | ✅ | ✅ |
| Create listings | ❌ | ✅ | ✅ |
| Make offers | ✅ | ✅ | ✅ |
| Leave reviews | ✅ | ✅ | ✅ |
| Access dashboard | ✅ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Delete any listing | ❌ | ❌ | ✅ |
| View reports | ❌ | ❌ | ✅ |

### 6.3 Listings Management

**Description:** Sellers can create, edit, and manage their listings.

**Create Listing Flow:**
1. Click "Sell" button (sellers only)
2. Step 1: Enter title, description, condition, category
3. Step 2: Enter price, location
4. Step 3: Upload images, review, publish

**Listing Statuses:**
| Status | Description |
|--------|-------------|
| Active | Listed and available for purchase |
| Sold | Item has been sold |
| Reserved | Item is pending transaction |
| Removed | Item was removed by seller or admin |

**Daily Limit:** 20 listings per seller per day

### 6.4 Messaging

**Description:** Buyers and sellers can communicate through the messaging system.

**How to Start:**
1. Go to a listing detail page
2. Click "Message Seller"
3. Start typing your message
4. Messages appear in real-time

**Message Features:**
- Real-time delivery
- Unread message count
- Message history
- Conversation threads

### 6.5 Favorites

**Description:** Users can save listings to their favorites for later.

**How to Use:**
1. Click heart icon on any listing
2. Listing added to favorites
3. View all favorites in "Favorites" page
4. Click heart again to remove

### 6.6 Reviews & Ratings

**Description:** Buyers can rate sellers after transactions.

**Review Features:**
- 1-5 star rating
- Written comment (optional)
- Linked to specific listing
- Visible on seller profile

### 6.7 Offers

**Description:** Buyers can make price offers on listings.

**Offer Flow:**
1. Go to listing detail
2. Click "Make Offer"
3. Enter offer amount
4. Add optional message
5. Seller receives notification
6. Seller can accept or decline

### 6.8 Admin Dashboard

**Description:** Admins can manage the entire platform.

**Admin Features:**
- View total users, listings, reports
- User breakdown by role
- Category distribution chart
- Recent users and listings
- User management (ban/unban)
- Listing moderation
- Report handling

---

## 7. API Reference

### 7.1 Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| POST | `/api/auth/register` | Register new user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |

**Login Request:**
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "buyer",
    "isAdmin": false
  }
}
```

### 7.2 Listings

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/listings` | Get all listings | No |
| GET | `/api/listings?category=electronics` | Filter by category | No |
| GET | `/api/listings?q=keyword` | Search listings | No |
| GET | `/api/listings?minPrice=1000&maxPrice=50000` | Filter by price | No |
| GET | `/api/listings?sort=price_asc` | Sort listings | No |
| POST | `/api/listings` | Create listing | Yes (Seller) |
| GET | `/api/listings/[id]` | Get single listing | No |
| PUT | `/api/listings/[id]` | Update listing | Yes (Owner) |
| DELETE | `/api/listings/[id]` | Delete listing | Yes (Owner) |
| PUT | `/api/listings/[id]/status` | Toggle status | Yes (Owner) |

**Create Listing Request:**
```json
POST /api/listings
{
  "title": "iPhone 14 Pro",
  "description": "Brand new, sealed box",
  "price": 45000,
  "categoryId": "uuid",
  "condition": "Brand New",
  "location": "Makati City",
  "images": ["https://example.com/image1.jpg"]
}
```

### 7.3 Categories

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/categories` | Get all categories | No |

**Response:**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Electronics",
      "slug": "electronics",
      "icon": "💻",
      "listingCount": 20
    }
  ]
}
```

### 7.4 Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/[id]` | Get user profile | No |
| PUT | `/api/users/[id]` | Update profile | Yes (Owner) |
| GET | `/api/users/me/favorites` | Get user favorites | Yes |
| GET | `/api/users/me/offers` | Get user offers | Yes |

### 7.5 Conversations & Messages

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/conversations` | List conversations | Yes |
| POST | `/api/conversations` | Start conversation | Yes |
| GET | `/api/conversations/[id]` | Get conversation | Yes |
| POST | `/api/messages` | Send message | Yes |

### 7.6 Reviews

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/reviews?userId=[id]` | Get user reviews | No |
| POST | `/api/reviews` | Create review | Yes |

### 7.7 Notifications

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications/count` | Get unread count | Yes |
| POST | `/api/notifications/subscribe` | Subscribe to push | Yes |

### 7.8 Admin

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users` | List all users | Yes (Admin) |
| GET | `/api/admin/listings` | List all listings | Yes (Admin) |
| GET | `/api/admin/reports` | List all reports | Yes (Admin) |

---

## 8. Authentication & Authorization

### 8.1 JWT Authentication

The application uses JWT (JSON Web Tokens) for authentication via the `jose` library.

**Token Structure:**
```json
{
  "userId": "uuid",
  "role": "buyer|seller|admin",
  "exp": 1234567890
}
```

**Token Storage:**
- Stored as httpOnly cookie named `session`
- 7-day expiration
- Secure in production
- SameSite: lax

### 8.2 Middleware Protection

Protected routes require valid JWT:
- `/sell`
- `/messages`
- `/favorites`
- `/notifications`
- `/profile/me`
- `/my-listings`
- `/offers`
- `/seller/dashboard`
- `/buyer/dashboard`
- `/admin/*`

### 8.3 Role-Based Access

**Middleware:** Checks JWT validity for protected routes
**Layout Components:** Check user role for admin/seller/buyer dashboards
**API Routes:** Use `requireAuth()` and `requireAdmin()` helpers

```typescript
// Example: Protecting an API route
import { requireAuth, requireAdmin } from '@/lib/auth';

export async function GET() {
  const user = await requireAuth(); // Throws if not authenticated
  // User is guaranteed to exist here
}

export async function DELETE() {
  const admin = await requireAdmin(); // Throws if not admin
  // Admin is guaranteed here
}
```

---

## 9. Deployment Guide

### 9.1 Vercel Deployment

**Automatic Deployment:**
1. Push to `main` branch
2. Vercel detects changes
3. Builds and deploys automatically
4. Available at `https://bai-and-sil.vercel.app`

**Manual Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 9.2 Environment Variables

Set in Vercel dashboard:
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | JWT secret key |
| `NEXTAUTH_URL` | Production URL |

### 9.3 Branch Strategy

| Branch | Purpose | Deploy |
|--------|---------|--------|
| `main` | Production | Auto-deploy to Vercel |
| `staging` | QA testing | Preview deployment |
| `testing` | Development | No auto-deploy |

---

## 10. Testing Guide

### 10.1 Automated Tests

Run the QA test suite:
```bash
# Start dev server first
npm run dev

# In another terminal
node scripts/qa-test.js
```

**Test Coverage (50 tests):**
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

### 10.2 Manual Testing

**Test Cases:**
1. Register as new user (buyer and seller)
2. Login with each role
3. Create a listing (seller)
4. Search and filter listings
5. Add to favorites
6. Send message to seller
7. Make an offer
8. Leave a review
9. Admin: View dashboard
10. Admin: Ban a user

### 10.3 Cross-Browser Testing

| Browser | Status |
|---------|--------|
| Chrome | ✅ Tested |
| Firefox | ✅ Tested |
| Safari | ✅ Tested |
| Edge | ✅ Tested |
| Mobile Chrome | ✅ Tested |
| Mobile Safari | ✅ Tested |

---

## 11. Troubleshooting

### 11.1 Common Issues

**Issue: Prisma Client Error**
```
Error: PrismaClient is not configured to run in Edge Runtime
```
**Solution:** Remove Prisma import from middleware.ts. Use JWT-only auth check in middleware.

**Issue: Session Not Persisting**
```
User logged in but navbar shows Login/Register
```
**Solution:** Ensure `credentials: "include"` is in all fetch calls.

**Issue: Images Not Loading**
```
Product cards show placeholder
```
**Solution:** Check if ListingImage records exist in database. Run `npx prisma db seed`.

**Issue: Admin Dashboard Shows 0 Categories**
```
Category counts show 0
```
**Solution:** Check API returns `listingCount` field. Admin dashboard reads this field.

### 11.2 Debug Commands

```bash
# Check database connection
npx prisma db push

# View database
npx prisma studio

# Check listing counts
node scripts/check-counts.js

# Reset database
npx prisma db push --force-reset
npx prisma db seed
```

---

## 12. Roadmap

### Phase 2: Security & Payments (Weeks 1-4)
- Email verification
- Password reset flow
- Rate limiting
- GCash/Maya integration
- Escrow system

### Phase 3: Real-time Features (Weeks 5-8)
- WebSocket messaging
- Push notifications
- Email notifications
- Typing indicators

### Phase 4: Trust & Verification (Weeks 9-12)
- Phone OTP verification
- ID verification for sellers
- Block user functionality
- Enhanced report system

### Phase 5: Search & Discovery (Weeks 13-16)
- Full-text search
- Location-based search
- Saved search alerts
- Trending items

### Phase 6: Seller Tools (Weeks 17-20)
- Listing analytics
- Bulk import
- Scheduled listings
- Promoted listings

### Phase 7: Mobile & Polish (Weeks 21-24)
- PWA setup
- Image optimization
- Performance tuning
- Final QA

---

## 13. Contributing

### 13.1 Branch Workflow

1. Create feature branch from `testing`
2. Make changes and test
3. Push to `testing`
4. Create PR to `staging`
5. QA review
6. Push to `main` for production

### 13.2 Code Standards

- Use TypeScript for all new files
- Follow existing code style
- Add `credentials: "include"` to all client fetch calls
- Use Prisma for database queries
- Test all changes before pushing

---

## 14. License

Private project — All rights reserved.

---

**BAI & SIL** — Built with love for the Filipino marketplace.

*Gawang Pinas, para sa Pinas.*
