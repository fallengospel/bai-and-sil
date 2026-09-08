# BAI & SIL — Feature Tracker

> Last updated: September 8, 2026
> Branch: `testing`

---

## Table of Contents

- [Roles Overview](#roles-overview)
- [Authentication & Account](#authentication--account)
- [Buyer Features](#buyer-features)
- [Seller Features](#seller-features)
- [Admin Features](#admin-features)
- [Shared Features](#shared-features)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Known Bugs](#known-bugs)
- [Missing Features](#missing-features)

---

## Roles Overview

| Role | Description | Access Level |
|------|-------------|--------------|
| **Guest** | Unauthenticated visitor | Browse listings, search, view profiles |
| **Buyer** | Registered user | + Favorites, messaging, offers, notifications, profile |
| **Seller** | Registered user who lists items | + Create/manage listings, receive offers |
| **Admin** | Platform administrator | + Full dashboard, user/listing/report management |

> **Note:** Buyer and Seller are the same account. Any registered user can both buy and sell.

---

## Authentication & Account

### Registration (`/register`)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Name | Text | Yes | Display name |
| Email | Email | Yes | Unique, used for login |
| Password | Password | Yes | Min 6 characters |
| Confirm Password | Password | Yes | Client-side validation only |
| Location | Select | No | Philippine cities/provinces dropdown |

### Login (`/login`)
| Field | Type | Required |
|-------|------|----------|
| Email | Email | Yes |
| Password | Password | Yes |

- JWT session cookie (7-day expiry)
- Redirect support via `?redirect=` parameter
- Wrong password / nonexistent email shows error

### Session Management
- HTTP-only secure cookies
- `GET /api/auth/me` returns current user
- `POST /api/auth/logout` destroys session
- Middleware protects: `/sell`, `/messages`, `/favorites`, `/notifications`, `/profile/me`, `/admin`

### Forgot Password (`/forgot-password`)
- ❌ **BROKEN** — Page exists but API endpoint missing

---

## Buyer Features

### Browse & Search
| Feature | Status | Location |
|---------|--------|----------|
| Homepage with Fresh Drops | ✅ Working | `/` |
| Browse by Category | ✅ Working | `/categories` |
| Advanced Search | ✅ Working | `/search` |
| Category Filter | ✅ Working | Search sidebar |
| Price Range Filter | ✅ Working | Search sidebar |
| Condition Filter | ✅ Working | Search sidebar |
| Location Filter | ✅ Working | Search sidebar |
| Sort (Newest/Price) | ✅ Working | Search sidebar |
| Pagination (Load More) | ✅ Working | Search results |
| View Listing Details | ✅ Working | `/listing/[slug]` |
| Image Gallery (zoom, thumbnails) | ✅ Working | Listing detail |

### Favorites
| Feature | Status | Location |
|---------|--------|----------|
| Toggle Favorite (heart icon) | ✅ Working | Listing detail, ProductCard |
| View Saved Items | ✅ Working | `/favorites` |
| Unfavorite from saved | ✅ Working | Favorites page |

### Messaging
| Feature | Status | Location |
|---------|--------|----------|
| Start Conversation with Seller | ✅ Working | Listing detail "Message Seller" |
| View Conversation List | ✅ Working | `/messages` |
| Send Messages | ✅ Working | `/messages/[id]` |
| Quick Prompt Buttons | ✅ Working | Chat UI |
| Unread Message Count | ⚠️ Hardcoded | Navbar shows "3" always |
| Real-time Polling (5s) | ✅ Working | Chat auto-refreshes |

### Offers
| Feature | Status | Location |
|---------|--------|----------|
| Make an Offer | ✅ Working | Listing detail, Chat |
| View Offers in Chat | ✅ Working | Conversation view |
| Offer Status Badges | ✅ Working | Pending/Accepted/Declined |
| Accept/Decline Offer | ❌ Missing | No UI for sellers |

### Notifications
| Feature | Status | Location |
|---------|--------|----------|
| View Notifications | ✅ Working | `/notifications` |
| Notification Icons (type-based) | ✅ Working | Notifications page |
| Read/Unread Styling | ✅ Working | Blue dot + bold text |
| Mark All Read | ✅ Working | Button on page |
| Mark Individual Read | ❌ Missing | Only "mark all" works |
| Notification Badge in Navbar | ⚠️ Hardcoded | Always shows "3" |

---

## Seller Features

### Create Listing (`/sell`)
| Step | Fields | Status |
|------|--------|--------|
| Step 1: Photos | Drag & drop upload, up to 8 images, cover photo selector | ✅ Working |
| Step 2: Details | Title, Category, Description (2000 char max), Price, Condition, Location | ✅ Working |
| Step 3: Preview | ProductCard preview, summary | ✅ Working |

**Conditions available:** Brand New, Like New, Good, Fair
**Rate limit:** 20 listings per day

### Manage Listings (`/my-listings`)
| Feature | Status | Location |
|---------|--------|----------|
| View All Own Listings | ✅ Working | `/my-listings` |
| Status Tabs (Active/Sold/Reserved/Removed) | ✅ Working | Tabs with counts |
| Edit Listing | ⚠️ Partial | Links to `/sell?edit=ID` but sell page ignores it |
| Mark as Reserved | ✅ Working | Listing detail (owner view) |
| Mark as Sold | ✅ Working | Listing detail (owner view) |
| Delete Listing | ✅ Working | Listing detail (soft-delete) |

### Receive Offers
| Feature | Status | Location |
|---------|--------|----------|
| View Buyer Offers in Chat | ✅ Working | Conversation view |
| Offer Amount Display | ✅ Working | Inline in chat |
| Accept/Decline Offers | ❌ Missing | No UI or API |

---

## Admin Features

### Admin Dashboard (`/admin`)
| Feature | Status | Location |
|---------|--------|----------|
| Stats Cards (Users, Listings, Sold, Reports) | ✅ Working | Dashboard |
| Recent Listings Table | ✅ Working | Dashboard |

### User Management (`/admin/users`)
| Feature | Status | Location |
|---------|--------|----------|
| View All Users | ✅ Working | Users table |
| Search Users | ✅ Working | Search input |
| Toggle Admin Status | ✅ Working | Button per row |
| Delete Users | ✅ Working | Cannot delete other admins |

### Listing Management (`/admin/listings`)
| Feature | Status | Location |
|---------|--------|----------|
| View All Listings | ✅ Working | Listings table |
| Search by Title | ✅ Working | Search input |
| Filter by Status | ✅ Working | Status dropdown |
| Remove Listings | ✅ Working | Button per row |

### Report Management (`/admin/reports`)
| Feature | Status | Location |
|---------|--------|----------|
| View All Reports | ✅ Working | Reports table |
| Search/Filter Reports | ✅ Working | Search + status filter |
| Mark as Reviewed | ✅ Working | Button per row |
| Dismiss Report | ✅ Working | Button per row |
| Remove Reported Listing | ✅ Working | Auto-marks report Reviewed |

### Category Management
| Feature | Status | Location |
|---------|--------|----------|
| Create Categories (API) | ✅ Working | `POST /api/categories` |
| Admin UI for Categories | ❌ Missing | No `/admin/categories` page |

---

## Shared Features

### User Profiles (`/profile/[id]`)
| Feature | Status | Location |
|---------|--------|----------|
| View Profile (avatar, name, location, rating) | ✅ Working | Profile page |
| Star Rating Display | ✅ Working | Profile + listing detail |
| Member Since Date | ✅ Working | Profile page |
| Active Listings Tab | ✅ Working | Profile tabs |
| Sold Listings Tab | ✅ Working | Profile tabs |
| Edit Profile (own) | ✅ Working | Modal (name, bio, location, avatar URL) |
| Message Seller | ⚠️ Partial | Goes to /messages list, not specific conversation |
| Report Seller | ⚠️ Broken | Passes empty listingId to ReportModal |
| Reviews Tab | ❌ Missing | API exists, no UI |

### Image Upload (`/api/upload`)
| Feature | Status | Notes |
|---------|--------|-------|
| Upload Image | ✅ Working | Saves to `/public/uploads/` |
| Auth Required | ❌ No | Anyone can upload |
| File Type Validation | ❌ No | Accepts any file |
| File Size Limit | ❌ No | No limit enforced |
| Image Optimization | ❌ No | Stores original size |

### Legal Pages
| Page | Status |
|------|--------|
| Terms of Service (`/terms`) | ✅ Working |
| Privacy Policy (`/privacy`) | ✅ Working |
| Safety Tips (`/safety`) | ✅ Working |

### SEO
| Feature | Status |
|---------|--------|
| Dynamic Sitemap (`/sitemap.xml`) | ✅ Working |
| Robots.txt (`/robots.txt`) | ✅ Working |
| OpenGraph Metadata | ✅ Working |
| Page Titles | ✅ Working |

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | No | Logout |
| GET | `/api/auth/me` | No | Current user |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/[id]` | No | Public profile |
| PUT | `/api/users/[id]` | Owner | Update profile |
| GET | `/api/users/[id]/reviews` | No | User reviews |
| POST | `/api/users/[id]/reviews` | Auth | Create review |
| GET | `/api/users/me/favorites` | Auth | My favorites |

### Listings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/listings` | No | Browse/search |
| POST | `/api/listings` | Auth | Create listing |
| GET | `/api/listings/[id]` | No | View listing |
| PUT | `/api/listings/[id]` | Owner | Update listing |
| DELETE | `/api/listings/[id]` | Owner | Delete listing |
| POST | `/api/listings/[id]/favorite` | Auth | Toggle favorite |
| POST | `/api/listings/[id]/report` | Auth | Report listing |

### Conversations
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/conversations` | Auth | List conversations |
| POST | `/api/conversations` | Auth | Start conversation |
| GET | `/api/conversations/[id]/messages` | Participant | Get messages |
| POST | `/api/conversations/[id]/messages` | Participant | Send message |
| GET | `/api/conversations/[id]/offers` | Participant | Get offers |
| POST | `/api/conversations/[id]/offers` | Buyer | Create offer |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | Auth | Get notifications |
| PUT | `/api/notifications` | Auth | Mark all read |

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | No | List categories |
| POST | `/api/categories` | Admin | Create category |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/users` | Admin | List users |
| PUT | `/api/admin/users/[id]` | Admin | Update user |
| DELETE | `/api/admin/users/[id]` | Admin | Delete user |
| GET | `/api/admin/listings` | Admin | List listings |
| DELETE | `/api/admin/listings/[id]` | Admin | Remove listing |
| GET | `/api/admin/reports` | Admin | List reports |
| PUT | `/api/admin/reports` | Admin | Update report |

### Upload
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/upload` | No | Upload image |

---

## Database Models

| Model | Records | Description |
|-------|---------|-------------|
| User | 3 seed + registrations | Buyer/Seller/Admin accounts |
| Listing | 240 seeded | Product listings |
| ListingImage | 240 seeded | One image per listing |
| Category | 12 seeded | Product categories |
| Favorite | — | User saved listings |
| Conversation | — | Buyer-seller threads |
| Message | — | Chat messages |
| Offer | — | Price offers |
| Review | — | User ratings |
| Report | — | Content reports |
| Notification | — | In-app notifications |
| ActionLog | — | ⚠️ Unused |

---

## Known Bugs

| # | Bug | Severity | Location |
|---|-----|----------|----------|
| 1 | Navbar unread badge hardcoded to "3" | Medium | `Navbar.tsx:124` |
| 2 | Messages "other user" detection uses wrong comparison | Medium | `messages/page.tsx:65` |
| 3 | Forgot password API missing | High | `/api/auth/forgot-password` |
| 4 | Listing edit link broken (sell page ignores `?edit=`) | High | `sell/page.tsx` |
| 5 | Upload API has no auth check | High | `/api/upload/route.ts` |
| 6 | No file type/size validation on upload | Medium | `/api/upload/route.ts` |
| 7 | Report modal from profile passes empty listingId | Medium | `profile/[id]/page.tsx:309` |
| 8 | Profile "Message" goes to list, not specific conversation | Low | `profile/[id]/page.tsx:138` |
| 9 | No admin category management UI | Low | Missing `/admin/categories` |
| 10 | No password change functionality | Medium | Missing API + UI |

---

## Missing Features

### High Priority
| Feature | Description |
|---------|-------------|
| Offer accept/decline | Sellers can't respond to offers |
| Listing edit form | Edit button links nowhere useful |
| Password change | Users can't change password |
| Upload auth + validation | Security risk |
| Reviews display on profile | API exists, no UI |

### Medium Priority
| Feature | Description |
|---------|-------------|
| Real-time messaging | WebSocket instead of polling |
| Notification badge (real count) | Currently hardcoded |
| Search URL sync | Shareable filter URLs |
| Image compression | Optimize uploads |
| Admin category management UI | API exists, no page |

### Low Priority
| Feature | Description |
|---------|-------------|
| Email verification | `emailVerified` field unused |
| Phone verification | `phoneVerified` field unused |
| Action logging | `ActionLog` model unused |
| Social login (Google/Facebook) | `authProvider` field unused |
| Listing expiration | Listings never auto-expire |
| User blocking | No blocking feature |
| Dark mode | Light theme only |
| i18n/localization | English primary |
| Message edit/delete | Messages permanent |
| Seller analytics | No view/save metrics |

---

## Page Inventory

| Route | Auth | Role | Status |
|-------|------|------|--------|
| `/` | No | Any | ✅ |
| `/login` | No | Guest | ✅ |
| `/register` | No | Guest | ✅ |
| `/forgot-password` | No | Guest | ⚠️ Broken |
| `/categories` | No | Any | ✅ |
| `/search` | No | Any | ✅ |
| `/listing/[slug]` | No | Any | ✅ |
| `/sell` | Yes | Seller | ✅ |
| `/my-listings` | Yes | Seller | ✅ |
| `/favorites` | Yes | Buyer | ✅ |
| `/messages` | Yes | Buyer/Seller | ✅ |
| `/messages/[id]` | Yes | Buyer/Seller | ✅ |
| `/notifications` | Yes | Any | ✅ |
| `/profile/[id]` | No | Any | ✅ |
| `/profile/me` | Yes | Any | ✅ |
| `/terms` | No | Any | ✅ |
| `/privacy` | No | Any | ✅ |
| `/safety` | No | Any | ✅ |
| `/admin` | Yes | Admin | ✅ |
| `/admin/users` | Yes | Admin | ✅ |
| `/admin/listings` | Yes | Admin | ✅ |
| `/admin/reports` | Yes | Admin | ✅ |

---

## Component Inventory

| Component | File | Used In |
|-----------|------|---------|
| Avatar | `ui/Avatar.tsx` | Navbar, Profile, Messages, ProductCard |
| Badge | `ui/Badge.tsx` | ProductCard, ListingDetail, Notifications |
| Button | `ui/Button.tsx` | Forms, Actions throughout |
| CategoryCard | `ui/CategoryCard.tsx` | Home, Categories |
| EmptyState | `ui/EmptyState.tsx` | Favorites, MyListings, Search, Messages |
| ImageGallery | `ui/ImageGallery.tsx` | Listing detail |
| Input | `ui/Input.tsx` | Forms throughout |
| LoadingSpinner | `ui/LoadingSpinner.tsx` | Page loads |
| Modal | `ui/Modal.tsx` | Edit profile, Offers, Reports |
| ProductCard | `ui/ProductCard.tsx` | Home, Search, Favorites, MyListings |
| ReportModal | `ui/ReportModal.tsx` | Listing detail, Profile |
| SearchBar | `ui/SearchBar.tsx` | Search page |
| Select | `ui/Select.tsx` | Forms, Filters |
| SellerCard | `ui/SellerCard.tsx` | Listing detail |
| StarRating | `ui/StarRating.tsx` | Profile, Listing detail |
| TextArea | `ui/TextArea.tsx` | Forms (listing description, report) |
| AuthProvider | `layout/AuthProvider.tsx` | ⚠️ Dead code (unused) |
| Footer | `layout/Footer.tsx` | Global layout |
| MobileNav | `layout/MobileNav.tsx` | Mobile bottom nav |
| Navbar | `layout/Navbar.tsx` | Global top nav |
