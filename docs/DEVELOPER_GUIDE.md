# BAI & SIL — Developer Guide

> **Version:** 1.0.0  
> **For:** Developers working on BAI & SIL  
> **Last Updated:** September 11, 2026

---

## Table of Contents

1. [Development Environment Setup](#1-development-environment-setup)
2. [Code Architecture](#2-code-architecture)
3. [Working with the Codebase](#3-working-with-the-codebase)
4. [API Development](#4-api-development)
5. [Database Changes](#5-database-changes)
6. [Component Development](#6-component-development)
7. [Testing](#7-testing)
8. [Git Workflow](#8-git-workflow)
9. [Deployment](#9-deployment)
10. [Common Patterns](#10-common-patterns)
11. [Performance Tips](#11-performance-tips)
12. [Security Best Practices](#12-security-best-practices)

---

## 1. Development Environment Setup

### 1.1 Prerequisites

```bash
# Required
node --version  # v18.16.1 or higher
npm --version   # 9.x or higher

# Recommended
git --version   # 2.x
vscode          # With extensions:
                # - ES7+ React/Redux/React-Native snippets
                # - Tailwind CSS IntelliSense
                # - Prisma
                # - TypeScript
```

### 1.2 Installation

```bash
# 1. Clone repository
git clone https://github.com/fallengospel/bai-and-sil.git
cd bai-and-sil

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Edit .env with your credentials
# DATABASE_URL="postgresql://..."
# NEXTAUTH_SECRET="your-secret"

# 5. Push database schema
npx prisma db push

# 6. Seed database
npx prisma db seed

# 7. Start development server
npm run dev
```

### 1.3 Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | Neon PostgreSQL URL | `postgresql://user:pass@ep-xxx.neon.tech/db` |
| `NEXTAUTH_SECRET` | Yes | JWT signing key | `your-secret-key-min-32-chars` |
| `NEXTAUTH_URL` | Yes | Application URL | `http://localhost:3000` |

### 1.4 VS Code Extensions

Install these extensions for better development experience:

```
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prisma
- TypeScript
- ESLint
- Prettier
```

---

## 2. Code Architecture

### 2.1 Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (main)/            # Main app pages
│   ├── (legal)/           # Legal pages
│   ├── admin/             # Admin dashboard
│   ├── seller/            # Seller dashboard
│   ├── buyer/             # Buyer dashboard
│   └── api/               # API routes
├── components/
│   ├── layout/            # Layout components (Navbar, Footer)
│   └── ui/                # Reusable UI components
└── lib/
    ├── prisma.ts          # Prisma client
    ├── auth.ts            # Authentication helpers
    └── helpers.ts         # Utility functions
```

### 2.2 Key Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | JWT auth check for protected routes |
| `src/lib/auth.ts` | Session management, password hashing |
| `src/lib/prisma.ts` | Database connection singleton |
| `src/lib/helpers.ts` | Format price, slugify, etc. |

### 2.3 Data Flow

```
Client Component
    ↓
fetch('/api/endpoint', { credentials: 'include' })
    ↓
API Route (src/app/api/...)
    ↓
requireAuth() / requireAdmin()
    ↓
prisma.query()
    ↓
PostgreSQL (Neon)
    ↓
Response → Client
```

---

## 3. Working with the Codebase

### 3.1 Adding a New Page

1. Create page file in appropriate directory:

```tsx
// src/app/(main)/my-page/page.tsx
"use client";

import { useState, useEffect } from "react";

export default function MyPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/my-endpoint", { credentials: "include" })
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <div>
      <h1>My Page</h1>
      {/* Content */}
    </div>
  );
}
```

2. If protected, add to middleware.ts:

```typescript
const protectedPaths = ['/sell', '/messages', '/my-page'];
```

### 3.2 Adding a New API Route

1. Create route file:

```typescript
// src/app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    const data = await prisma.listing.findMany({
      where: { sellerId: user.id },
    });

    return NextResponse.json({ data });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    // Validate input
    if (!body.title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 });
    }

    // Create record
    const record = await prisma.listing.create({
      data: {
        sellerId: user.id,
        title: body.title,
        // ... other fields
      },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 3.3 Adding a New Component

1. Create component file:

```tsx
// src/components/ui/MyComponent.tsx
"use client";

import React from "react";

interface MyComponentProps {
  title: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onClick,
  children,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      {children}
      {onClick && (
        <button onClick={onClick} className="mt-2 text-sm text-[#1a56db]">
          Click me
        </button>
      )}
    </div>
  );
};

export default MyComponent;
```

---

## 4. API Development

### 4.1 Authentication Helpers

```typescript
import { requireAuth, requireAdmin, getSession } from '@/lib/auth';

// Require authenticated user
const user = await requireAuth();
// Returns: { id, name, email, avatar, role, isAdmin }

// Require admin user
const admin = await requireAdmin();
// Returns: { id, name, email, avatar, role: 'admin', isAdmin: true }

// Optional session check (returns null if not authenticated)
const session = await getSession();
```

### 4.2 Prisma Queries

```typescript
import { prisma } from '@/lib/prisma';

// Find many with relations
const listings = await prisma.listing.findMany({
  where: { status: 'Active' },
  include: {
    seller: { select: { id: true, name: true, avatar: true } },
    category: true,
    images: { take: 1, orderBy: { sortOrder: 'asc' } },
    _count: { select: { favorites: true } },
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: 0,
});

// Create with relations
const listing = await prisma.listing.create({
  data: {
    sellerId: user.id,
    title: 'My Listing',
    slug: 'my-listing',
    description: 'Description',
    price: 1000,
    categoryId: 'category-id',
    condition: 'Brand New',
    location: 'Makati City',
    images: {
      create: [
        { imageUrl: 'https://...', sortOrder: 0 },
      ],
    },
  },
  include: {
    seller: { select: { id: true, name: true } },
    category: true,
    images: true,
  },
});

// Update
const updated = await prisma.listing.update({
  where: { id: listingId },
  data: { status: 'Sold' },
});

// Delete (soft delete - set status to Removed)
await prisma.listing.update({
  where: { id: listingId },
  data: { status: 'Removed' },
});
```

### 4.3 Error Handling Pattern

```typescript
export async function GET(request: NextRequest) {
  try {
    // Business logic
    const data = await prisma.listing.findMany();
    return NextResponse.json({ data });
  } catch (error: any) {
    // Handle known errors
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Handle unknown errors
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## 5. Database Changes

### 5.1 Adding a New Model

1. Edit `prisma/schema.prisma`:

```prisma
model MyModel {
  id        String   @id @default(uuid())
  userId    String
  listingId String
  status    String   @default("pending")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user    User    @relation(fields: [userId], references: [id])
  listing Listing @relation(fields: [listingId], references: [id])

  @@unique([userId, listingId])
}
```

2. Add relations to existing models:

```prisma
model User {
  // ... existing fields
  myModels MyModel[]
}

model Listing {
  // ... existing fields
  myModels MyModel[]
}
```

3. Push to database:

```bash
npx prisma db push
```

4. Regenerate Prisma client:

```bash
npx prisma generate
```

### 5.2 Migration Commands

```bash
# Push schema changes (development)
npx prisma db push

# Create migration (production)
npx prisma migrate dev --name add_my_model

# Reset database
npx prisma db push --force-reset
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

---

## 6. Component Development

### 6.1 Component Templates

**Button Component:**
```tsx
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  fullWidth = false,
}) => {
  const baseClasses = "font-medium rounded-xl transition-all duration-200";
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  const variantClasses = {
    primary: "bg-[#1a56db] text-white hover:bg-[#1a56db]/90",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border border-[#1a56db]/30 text-[#1a56db] hover:bg-[#1a56db]/5",
    ghost: "text-gray-700 hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${
        fullWidth ? "w-full" : ""
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default Button;
```

### 6.2 Client vs Server Components

**Client Component** (interactive, uses state):
```tsx
"use client";
// ... component with useState, useEffect, etc.
```

**Server Component** (static, fetches data):
```tsx
// No "use client" directive
async function getListings() {
  return prisma.listing.findMany();
}

export default async function ListingsPage() {
  const listings = await getListings();
  return <div>{/* render listings */}</div>;
}
```

---

## 7. Testing

### 7.1 Running Tests

```bash
# Start dev server
npm run dev

# Run QA tests (in another terminal)
node scripts/qa-test.js

# Run specific test
node scripts/qa-test.js --filter "authentication"
```

### 7.2 Writing Tests

Add new tests to `scripts/qa-test.js`:

```javascript
await test('My new test', async () => {
  const r = await get('/api/my-endpoint');
  assert(r.status === 200, 'Should return 200');
  assert(r.body.data, 'Should have data');
});
```

### 7.3 Manual Testing Checklist

- [ ] Login as buyer, seller, admin
- [ ] Create listing (seller)
- [ ] Edit listing (seller)
- [ ] Delete listing (seller)
- [ ] Search listings (all)
- [ ] Filter by category (all)
- [ ] Add to favorites (buyer)
- [ ] Send message (buyer)
- [ ] Make offer (buyer)
- [ ] Accept offer (seller)
- [ ] Leave review (buyer)
- [ ] View profile (all)
- [ ] Admin: View dashboard
- [ ] Admin: Ban user

---

## 8. Git Workflow

### 8.1 Branch Strategy

```
testing (development)
    ↓
staging (QA review)
    ↓
main (production)
```

### 8.2 Commit Messages

```bash
# Format: type(scope): description

# Examples:
feat(auth): add email verification
fix(listings): correct image URL handling
docs(readme): update setup instructions
test(api): add listings endpoint tests
refactor(components): extract ProductCard
```

### 8.3 Push Workflow

```bash
# 1. Make changes
git add -A

# 2. Commit with descriptive message
git commit -m "feat(listings): add bulk import"

# 3. Push to testing
git push origin testing

# 4. After QA review, push to staging
git push origin testing:staging

# 5. After final review, push to main
git push origin testing:main
```

---

## 9. Deployment

### 9.1 Vercel Deployment

**Automatic:**
- Push to `main` → Vercel auto-deploys
- Push to `staging` → Preview deployment

**Manual:**
```bash
npx vercel --prod
```

### 9.2 Environment Variables

Set in Vercel dashboard:
1. Go to Project Settings
2. Click "Environment Variables"
3. Add each variable:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to `https://bai-and-sil.vercel.app`)

### 9.3 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Build succeeds locally

---

## 10. Common Patterns

### 10.1 Fetching Data (Client)

```tsx
"use client";
import { useState, useEffect } from "react";

export default function MyPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/endpoint", { credentials: "include" })
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  return <div>{/* render data */}</div>;
}
```

### 10.2 Form Submission

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch("/api/endpoint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title, description }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Failed");
      return;
    }

    toast.success("Success!");
    router.push("/redirect-path");
  } catch {
    toast.error("Something went wrong");
  } finally {
    setLoading(false);
  }
};
```

### 10.3 Protected Route Check

```tsx
// In layout.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.isAdmin || data.user?.role === "admin") {
          setAuthorized(true);
        } else {
          router.push("/");
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  if (!authorized) return null;
  return <div>{children}</div>;
}
```

---

## 11. Performance Tips

### 11.1 Image Optimization

```tsx
// Use Next.js Image component
import Image from "next/image";

<Image
  src={listing.imageUrl}
  alt={listing.title}
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL="/placeholder.svg"
/>
```

### 11.2 Data Fetching

```tsx
// Server Component (faster, no client waterfall)
async function getListings() {
  return prisma.listing.findMany({
    select: { id: true, title: true, price: true },
    take: 20,
  });
}

// Client Component with SWR
import useSWR from 'swr';

function Listings() {
  const { data, error, isLoading } = useSWR(
    '/api/listings',
    (url) => fetch(url, { credentials: 'include' }).then(r => r.json())
  );
}
```

### 11.3 Bundle Size

```bash
# Check bundle size
npm run build
# Look at .next/analyze/client.html
```

---

## 12. Security Best Practices

### 12.1 Authentication

- Always use `credentials: "include"` for client fetches
- Never store JWT in localStorage
- Use httpOnly cookies
- Validate JWT on every protected request

### 12.2 Input Validation

```typescript
// Validate on server
if (!title || title.length < 3) {
  return NextResponse.json({ error: 'Invalid title' }, { status: 400 });
}

// Validate on client
if (title.length < 3) {
  setError('Title must be at least 3 characters');
  return;
}
```

### 12.3 SQL Injection

```typescript
// Always use Prisma (parameterized queries)
const user = await prisma.user.findUnique({
  where: { email: userEmail }, // Safe
});

// NEVER use raw queries with user input
// BAD: prisma.$queryRaw(`SELECT * FROM users WHERE email = '${email}'`)
```

### 12.4 Environment Variables

- Never commit `.env` files
- Use `.env.example` as template
- Rotate secrets regularly
- Use different secrets for dev/prod

### 12.5 Error Handling

```typescript
// Don't expose internal errors to client
try {
  // business logic
} catch (error) {
  console.error('Server error:', error); // Log internally
  return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
}
```

---

## Quick Reference

### Important Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npx prisma db push   # Push schema to DB
npx prisma studio    # Open Prisma GUI
npx prisma generate  # Regenerate Prisma client
node scripts/qa-test.js  # Run QA tests
```

### Key Files

```
src/middleware.ts     # Auth middleware
src/lib/auth.ts      # Auth helpers
src/lib/prisma.ts    # DB client
src/lib/helpers.ts   # Utilities
```

### Color Palette

```css
--blue: #1a56db      /* Primary */
--yellow: #f5a623    /* Seller/Accent */
--red: #e8634a       /* Admin/Danger */
--green: #22c55e     /* Success */
```

---

**Need help?** Check the main [DOCUMENTATION.md](./DOCUMENTATION.md) or ask the team.
