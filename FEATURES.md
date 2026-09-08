# BAI & SIL - Feature Tracker

## 🎯 Overview
This document tracks all features implemented in the BAI & SIL Filipino marketplace.

---

## 👤 Role System

### Buyer Account
| Feature | Status | Notes |
|---------|--------|-------|
| Register as Buyer | ✅ Done | Email + password registration |
| Browse all listings | ✅ Done | Homepage, categories, search |
| View seller profiles | ✅ Done | See seller info, listings, ratings |
| View seller's listed items | ✅ Done | Profile page shows seller listings |
| Save favorites | ✅ Done | Heart icon on listings |
| Send messages | ✅ Done | Contact sellers directly |
| Make offers | ✅ Done | Submit price offers |
| View notifications | ✅ Done | Notification center |
| Profile page | ✅ Done | Shows favorites, reviews tabs |

### Seller Account
| Feature | Status | Notes |
|---------|--------|-------|
| Register as Seller | ✅ Done | Email + password registration |
| Create listings | ✅ Done | 3-step wizard (Details, Photos, Review) |
| Upload item photos | ✅ Done | Multiple images, drag & drop |
| Add item details | ✅ Done | Title, price, condition, description, category |
| Manage listings | ✅ Done | My Listings page with status tabs |
| Edit listings | 🔲 Pending | Edit existing listing |
| Receive offers | ✅ Done | View and respond to buyer offers |
| Accept/decline offers | 🔲 Pending | Offer management |
| View profile | ✅ Done | Shows listings, sold items, stats |
| Edit profile | ✅ Done | Name, bio, location, avatar, phone |

### Admin Account
| Feature | Status | Notes |
|---------|--------|-------|
| Admin dashboard | ✅ Done | Overview stats |
| Manage users | ✅ Done | View, edit, ban users |
| Manage listings | ✅ Done | Review, approve, remove listings |
| Manage reports | ✅ Done | Handle reported content |
| View action logs | ✅ Done | Audit trail |
| Full system control | ✅ Done | All operations accessible |

---

## 🔐 Authentication & Account

| Feature | Status | Notes |
|---------|--------|-------|
| Email registration | ✅ Done | With role selection (Buyer/Seller) |
| Login | ✅ Done | Email + password |
| Session management | ✅ Done | JWT tokens, 7-day expiry |
| Logout | ✅ Done | Clear session |
| Password hashing | ✅ Done | bcryptjs, 12 rounds |
| Email validation | ✅ Done | Format validation |
| Password confirmation | ✅ Done | Must match on register |
| Phone number field | ✅ Done | Optional, stored in profile |

---

## 🏠 Pages & Routes

| Route | Auth Required | Roles | Status |
|-------|---------------|-------|--------|
| `/` | No | All | ✅ Done |
| `/categories` | No | All | ✅ Done |
| `/categories/[slug]` | No | All | ✅ Done |
| `/search` | No | All | ✅ Done |
| `/listing/[slug]` | No | All | ✅ Done |
| `/register` | No | Guest | ✅ Done |
| `/login` | No | Guest | ✅ Done |
| `/sell` | Yes | Seller | ✅ Done |
| `/my-listings` | Yes | Seller | ✅ Done |
| `/messages` | Yes | All | ✅ Done |
| `/favorites` | Yes | Buyer | ✅ Done |
| `/notifications` | Yes | All | ✅ Done |
| `/profile/[id]` | No | All | ✅ Done |
| `/admin` | Yes | Admin | ✅ Done |
| `/admin/users` | Yes | Admin | ✅ Done |
| `/admin/listings` | Yes | Admin | ✅ Done |
| `/admin/reports` | Yes | Admin | ✅ Done |
| `/legal/privacy` | No | All | ✅ Done |
| `/legal/terms` | No | All | ✅ Done |

---

## 🔌 API Endpoints

### Auth
| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| `/api/auth/register` | POST | No | ✅ Done |
| `/api/auth/login` | POST | No | ✅ Done |
| `/api/auth/logout` | POST | Yes | ✅ Done |
| `/api/auth/me` | GET | Yes | ✅ Done |

### Users
| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| `/api/users/[id]` | GET | No | ✅ Done |
| `/api/users/[id]` | PUT | Owner | ✅ Done |
| `/api/users/me/favorites` | GET | Yes | ✅ Done |

### Listings
| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| `/api/listings` | GET | No | ✅ Done |
| `/api/listings/[id]` | GET | No | ✅ Done |
| `/api/listings/[slug]` | GET | No | ✅ Done |
| `/api/listings` | POST | Seller | ✅ Done |
| `/api/listings/[id]` | PUT | Owner | ✅ Done |
| `/api/listings/[id]` | DELETE | Owner/Admin | ✅ Done |
| `/api/listings/[id]/favorite` | POST | Yes | ✅ Done |
| `/api/listings/[id]/report` | POST | Yes | ✅ Done |
| `/api/listings/[id]/offers` | GET/POST | Yes | ✅ Done |

### Categories
| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| `/api/categories` | GET | No | ✅ Done |
| `/api/categories/[slug]` | GET | No | ✅ Done |

### Messages
| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| `/api/messages` | GET | Yes | ✅ Done |
| `/api/messages` | POST | Yes | ✅ Done |
| `/api/messages/[id]` | GET | Yes | ✅ Done |

### Admin
| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| `/api/admin/stats` | GET | Admin | ✅ Done |
| `/api/admin/users` | GET | Admin | ✅ Done |
| `/api/admin/listings` | GET | Admin | ✅ Done |
| `/api/admin/reports` | GET | Admin | ✅ Done |

---

## 🧩 Components

### UI Components
| Component | Status | Notes |
|-----------|--------|-------|
| Avatar | ✅ Done | User profile pictures |
| Badge | ✅ Done | Status indicators |
| Button | ✅ Done | Primary, secondary, ghost variants |
| EmptyState | ✅ Done | No data placeholder |
| ImageGallery | ✅ Done | Listing image carousel |
| Input | ✅ Done | Form input with label |
| LoadingSpinner | ✅ Done | Loading indicator |
| Modal | ✅ Done | Dialog component |
| ProductCard | ✅ Done | Listing card for grids |
| ReportModal | ✅ Done | Report content dialog |
| SearchBar | ✅ Done | Search input |
| Select | ✅ Done | Dropdown select |
| StarRating | ✅ Done | Rating display/input |
| TextArea | ✅ Done | Multi-line input |

### Layout Components
| Component | Status | Notes |
|-----------|--------|-------|
| Navbar | ✅ Done | Role-based navigation |
| Footer | ✅ Done | Site footer |
| Sidebar | ✅ Done | Category sidebar |

---

## 📊 Database Models

| Model | Status | Records |
|-------|--------|---------|
| User | ✅ Done | 3 (admin, seller, buyer) |
| Category | ✅ Done | 12 |
| Listing | ✅ Done | 240 |
| ListingImage | ✅ Done | 240+ |
| Favorite | ✅ Done | - |
| Message | ✅ Done | - |
| Conversation | ✅ Done | - |
| Offer | ✅ Done | - |
| Review | ✅ Done | - |
| Report | ✅ Done | - |
| Notification | ✅ Done | - |
| ActionLog | ✅ Done | - |

---

## 🐛 Known Bugs

| Bug | Severity | Status |
|-----|----------|--------|
| Search category filter uses wrong data | Medium | ✅ Fixed |
| Favorites page missing API | High | ✅ Fixed |
| Report modal wrong endpoint | Medium | ✅ Fixed |
| Login redirect not working | Medium | ✅ Fixed |
| My Listings page missing | High | ✅ Fixed |
| Image fallback not working | Low | ✅ Fixed |
| Profile Saved tab shows nothing | Low | 🔄 Partial |

---

## 📋 Missing Features (Future)

| Feature | Priority | Status |
|---------|----------|--------|
| Edit listing mode | High | 🔲 Pending |
| Offer accept/decline | High | 🔲 Pending |
| Forgot password | Medium | 🔲 Pending |
| Image validation | Medium | 🔲 Pending |
| Real notification count | Medium | 🔲 Pending |
| Search URL sync | Low | 🔲 Pending |
| Avatar upload | Low | 🔲 Pending |
| Reviews from buyers | Medium | 🔲 Pending |

---

## 🔧 Technical Stack

- **Frontend**: Next.js 13, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma 5.22.0
- **Auth**: JWT (jose), bcryptjs
- **Icons**: react-icons
- **Images**: Pexels URLs
- **Deployment**: Vercel

---

## 📝 Recent Changes

### Phase 1 (Testing Branch)
1. ✅ Search category filter fix
2. ✅ Favorites API endpoint
3. ✅ Report modal endpoint fix
4. ✅ Login redirect handling
5. ✅ My Listings page
6. ✅ Image fallback handling
7. ✅ Features.md created

### Phase 2 (Current)
1. ✅ Role-based registration (Buyer/Seller)
2. ✅ User model updated with role field
3. ✅ Phone number field added
4. ✅ Profile shows role badge
5. ✅ Navbar role-based navigation
6. ✅ Profile tabs role-based (Seller: Listings/Sold, Buyer: Favorites/Reviews)

---

*Last updated: September 8, 2026*
