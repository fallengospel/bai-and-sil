# BAI & SIL — Phase 2 Implementation Plan

> **Version:** 1.0.0  
> **Date:** September 11, 2026  
> **Duration:** 24 Weeks (6 Months)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Sprint 1: Security & Auth Foundation](#2-sprint-1-security--auth-foundation)
3. [Sprint 2: Payment System](#3-sprint-2-payment-system)
4. [Sprint 3: Real-time Messaging](#4-sprint-3-real-time-messaging)
5. [Sprint 4: Notifications System](#5-sprint-4-notifications-system)
6. [Sprint 5: User Verification & Trust](#6-sprint-5-user-verification--trust)
7. [Sprint 6: Search & Discovery](#7-sprint-6-search--discovery)
8. [Sprint 7: Seller Tools](#8-sprint-7-seller-tools)
9. [Sprint 8: Admin & Moderation](#9-sprint-8-admin--moderation)
10. [Sprint 9: Mobile & Performance](#10-sprint-9-mobile--performance)
11. [Sprint 10: Polish & Launch Prep](#11-sprint-10-polish--launch-prep)
12. [Testing Strategy](#12-testing-strategy)
13. [Timeline & Milestones](#13-timeline--milestones)

---

## 1. Executive Summary

### Current State (MVP Complete)
- ✅ Browse, search, filter, sort
- ✅ User registration with roles (buyer/seller/admin)
- ✅ JWT authentication with role-based access
- ✅ Listings CRUD
- ✅ Messaging system
- ✅ Favorites
- ✅ Reviews
- ✅ Offers
- ✅ Admin dashboard
- ✅ Filipino branding
- ✅ Dark mode & i18n

### Phase 2 Goals
1. Secure the platform (email verification, rate limiting)
2. Enable transactions (GCash/Maya, escrow)
3. Real-time communication (WebSocket messaging)
4. Build trust (ID verification, block users)
5. Improve discovery (full-text search, recommendations)
6. Scale (seller tools, analytics)

---

## 2. Sprint 1: Security & Auth Foundation (Week 1-2)

### 2.1 Email Verification

**Objective:** Verify user emails on registration

**Tasks:**
- [ ] Add `emailVerified` field to User model
- [ ] Create VerificationToken model
- [ ] Install Nodemailer/Resend for email sending
- [ ] Create verification email template
- [ ] Send verification email on registration
- [ ] Create verify endpoint: `/api/auth/verify?token=xxx`
- [ ] Block unverified users from creating listings
- [ ] Add "Resend verification" option

**Database Changes:**
```prisma
model VerificationToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

**Testing:**
- [ ] Test registration sends email
- [ ] Test verification link works
- [ ] Test token expiry (24 hours)
- [ ] Test unverified user blocked from listing

### 2.2 Password Reset

**Objective:** Allow users to reset forgotten passwords

**Tasks:**
- [ ] Create ResetToken model (15min expiry)
- [ ] Create forgot password API: `/api/auth/forgot-password`
- [ ] Create reset password page: `/reset-password?token=xxx`
- [ ] Send email with reset link
- [ ] Validate token and update password
- [ ] Invalidate used tokens

**Database Changes:**
```prisma
model ResetToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

**Testing:**
- [ ] Test forgot password sends email
- [ ] Test reset link works
- [ ] Test token expiry (15 minutes)
- [ ] Test invalid token rejected
- [ ] Test used token rejected

### 2.3 Rate Limiting

**Objective:** Prevent brute force attacks

**Tasks:**
- [ ] Install express-rate-limit
- [ ] Create rate limiter middleware
- [ ] Apply to auth routes (5 attempts/min)
- [ ] Apply to API routes (60 requests/min)
- [ ] Apply to upload routes (10 requests/min)
- [ ] Add rate limit headers

**Testing:**
- [ ] Test brute force protection
- [ ] Test legitimate usage not blocked
- [ ] Test different limits per route

### 2.4 Security Headers

**Objective:** Add security headers

**Tasks:**
- [ ] Add CSP headers in next.config.js
- [ ] Add X-Frame-Options
- [ ] Add X-Content-Type-Options
- [ ] Configure CORS
- [ ] Add HSTS headers

**Testing:**
- [ ] Test headers present
- [ ] Test no broken functionality

---

## 3. Sprint 2: Payment System (Week 3-4)

### 3.1 Payment Models

**Objective:** Create database structure for transactions

**Tasks:**
- [ ] Create Transaction model
- [ ] Create Escrow model
- [ ] Add `price` validation on listings
- [ ] Create payment service (`src/lib/payment.ts`)

**Database Changes:**
```prisma
model Transaction {
  id            String   @id @default(uuid())
  buyerId       String
  sellerId      String
  listingId     String
  amount        Float
  paymentMethod String   // gcash, maya, cod
  status        String   @default("pending") // pending, paid, completed, disputed, refunded
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  buyer  User    @relation("BuyerTransactions", fields: [buyerId], references: [id])
  seller User    @relation("SellerTransactions", fields: [sellerId], references: [id])
  listing Listing @relation(fields: [listingId], references: [id])
  escrow  Escrow?
}

model Escrow {
  id            String   @id @default(uuid())
  transactionId String   @unique
  status        String   @default("held") // held, released, refunded
  heldAt        DateTime @default(now())
  releasedAt    DateTime?
  transaction   Transaction @relation(fields: [transactionId], references: [id])
}
```

**Testing:**
- [ ] Test model creation
- [ ] Test relations work
- [ ] Test constraints

### 3.2 GCash/Maya Integration

**Objective:** Enable e-wallet payments

**Tasks:**
- [ ] Create GCash QR code generation
- [ ] Create Maya payment link generation
- [ ] Implement payment status polling
- [ ] Create webhook handler for payment confirmation
- [ ] Add payment success/failure pages

**Testing:**
- [ ] Test sandbox payments
- [ ] Test status updates
- [ ] Test webhook handling

### 3.3 Escrow Flow

**Objective:** Hold payment until buyer confirms

**Tasks:**
- [ ] Buyer pays → money in escrow
- [ ] Seller ships/meets → buyer confirms
- [ ] Auto-release after 3 days
- [ ] Dispute opens escrow hold
- [ ] Admin mediates disputes

**Testing:**
- [ ] Test full flow
- [ ] Test timeout auto-release
- [ ] Test dispute scenarios

### 3.4 Transaction UI

**Objective:** User-facing transaction management

**Tasks:**
- [ ] Create `/transactions` page
- [ ] Buyer view: pending, completed, disputed
- [ ] Seller view: incoming, completed, disputed
- [ ] Payment status badges
- [ ] Receipt generation (PDF)

**Testing:**
- [ ] Test all statuses display
- [ ] Test receipt download

### 3.5 Cash on Meet-up

**Objective:** Support in-person payments

**Tasks:**
- [ ] Add `paymentMethod` to checkout
- [ ] COD flow: no escrow
- [ ] Meet-up confirmation flow

**Testing:**
- [ ] Test COD selection
- [ ] Test confirmation flow

---

## 4. Sprint 3: Real-time Messaging (Week 5-6)

### 4.1 WebSocket Setup

**Objective:** Enable real-time communication

**Tasks:**
- [ ] Install socket.io
- [ ] Create WebSocket server in custom server
- [ ] Add authentication middleware for socket
- [ ] Implement room management (conversation-based)

**Testing:**
- [ ] Test connection
- [ ] Test authentication
- [ ] Test room join/leave

### 4.2 Real-time Chat

**Objective:** Replace polling with WebSocket

**Tasks:**
- [ ] Replace polling with WebSocket events
- [ ] Add message delivery status (sent, delivered, read)
- [ ] Add typing indicators
- [ ] Add online/offline status

**Testing:**
- [ ] Test message delivery
- [ ] Test typing indicators
- [ ] Test online status

### 4.3 Message Persistence

**Objective:** Store and retrieve messages

**Tasks:**
- [ ] Store messages in DB
- [ ] Implement message history pagination
- [ ] Add image/file sharing in chat

**Testing:**
- [ ] Test history load
- [ ] Test pagination
- [ ] Test file upload

### 4.4 Chat UI Improvements

**Objective:** Enhance chat experience

**Tasks:**
- [ ] Unread message count badge
- [ ] New message notification sound
- [ ] Message search
- [ ] Delete/conversation archive

**Testing:**
- [ ] Test unread counts
- [ ] Test notifications
- [ ] Test search

---

## 5. Sprint 4: Notifications System (Week 7-8)

### 5.1 Notification Models

**Objective:** Create notification infrastructure

**Tasks:**
- [ ] Create Notification model
- [ ] Define notification types
- [ ] Create notification API

**Database Changes:**
```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      String   // offer, message, review, sold, price_drop, system
  title     String
  body      String
  read      Boolean  @default(false)
  data      Json?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

**Testing:**
- [ ] Test CRUD operations
- [ ] Test read/unread

### 5.2 Email Notifications

**Objective:** Send email notifications

**Tasks:**
- [ ] Welcome email (on registration)
- [ ] New offer received
- [ ] Item sold
- [ ] New review
- [ ] Price drop alert

**Testing:**
- [ ] Test each email type
- [ ] Test unsubscribe

### 5.3 Push Notifications

**Objective:** Browser push notifications

**Tasks:**
- [ ] Set up VAPID keys
- [ ] Implement subscribe/unsubscribe flow
- [ ] Push on new message, offer, review

**Testing:**
- [ ] Test subscribe
- [ ] Test receive push
- [ ] Test unsubscribe

### 5.4 Notification Center

**Objective:** User-facing notification management

**Tasks:**
- [ ] Create `/notifications` page
- [ ] Mark as read (single, all)
- [ ] Notification preferences

**Testing:**
- [ ] Test read/unread
- [ ] Test preferences

---

## 6. Sprint 5: User Verification & Trust (Week 9-10)

### 6.1 Phone Verification

**Objective:** Verify phone numbers

**Tasks:**
- [ ] Add `phoneVerified` field to User
- [ ] Create OTP generation (6 digits, 5min expiry)
- [ ] Integrate SMS via Twilio/Infobip
- [ ] Create verify endpoint: `/api/auth/verify-phone`

**Testing:**
- [ ] Test OTP send
- [ ] Test verify
- [ ] Test expiry
- [ ] Test wrong OTP

### 6.2 ID Verification for Sellers

**Objective:** Verify seller identity

**Tasks:**
- [ ] Create VerificationRequest model
- [ ] Upload government ID (front/back)
- [ ] Admin review queue
- [ ] Approve/reject with reason
- [ ] Verified badge on profile

**Testing:**
- [ ] Test upload
- [ ] Test admin review
- [ ] Test badge display

### 6.3 Block User

**Objective:** Prevent unwanted interactions

**Tasks:**
- [ ] Create Block model
- [ ] Block/unblock API
- [ ] Blocked users can't message
- [ ] Blocked users can't see listings

**Testing:**
- [ ] Test block flow
- [ ] Test message blocked user
- [ ] Test visibility

### 6.4 Report System Enhancement

**Objective:** Improve content moderation

**Tasks:**
- [ ] Report user (not just listing)
- [ ] Report reasons: scam, inappropriate, fake
- [ ] Admin review queue
- [ ] Auto-warn after X reports

**Testing:**
- [ ] Test report flow
- [ ] Test admin queue
- [ ] Test auto-warn

---

## 7. Sprint 6: Search & Discovery (Week 11-12)

### 7.1 Full-Text Search

**Objective:** Improve search accuracy

**Tasks:**
- [ ] Add PostgreSQL GIN index
- [ ] Implement search ranking
- [ ] Add autocomplete suggestions

**Testing:**
- [ ] Test search accuracy
- [ ] Test performance
- [ ] Test edge cases

### 7.2 Location-Based Search

**Objective:** Find items nearby

**Tasks:**
- [ ] Add lat/lng to listings
- [ ] Distance filter (5km, 10km, 50km)
- [ ] Sort by distance

**Testing:**
- [ ] Test distance calculation
- [ ] Test nearby listings

### 7.3 Saved Search Alerts

**Objective:** Notify users of matching items

**Tasks:**
- [ ] Email when matching item listed
- [ ] Daily digest option
- [ ] Unsubscribe from alerts

**Testing:**
- [ ] Test alert trigger
- [ ] Test email content
- [ ] Test unsubscribe

### 7.4 Trending & Recommendations

**Objective:** Surface popular items

**Tasks:**
- [ ] Trending items (views + favorites)
- [ ] "Because you viewed" recommendations
- [ ] Category-based suggestions

**Testing:**
- [ ] Test trending accuracy
- [ ] Test recommendations

---

## 8. Sprint 7: Seller Tools (Week 13-14)

### 8.1 Listing Analytics

**Objective:** Provide seller insights

**Tasks:**
- [ ] Track views per day
- [ ] Track favorites per day
- [ ] Conversion rate
- [ ] Analytics dashboard

**Testing:**
- [ ] Test data accuracy
- [ ] Test chart display

### 8.2 Bulk Import

**Objective:** Enable mass listing creation

**Tasks:**
- [ ] CSV template download
- [ ] CSV upload and validation
- [ ] Preview before import
- [ ] Import with error handling

**Testing:**
- [ ] Test valid CSV
- [ ] Test invalid data
- [ ] Test duplicate handling

### 8.3 Scheduled Listings

**Objective:** Publish listings later

**Tasks:**
- [ ] Add `publishAt` field
- [ ] Set future publish date
- [ ] Cron job to publish

**Testing:**
- [ ] Test schedule
- [ ] Test auto-publish
- [ ] Test edit before publish

### 8.4 Promoted Listings

**Objective:** Paid visibility boost

**Tasks:**
- [ ] Promotion model
- [ ] Payment for promotion
- [ ] Promoted badge

**Testing:**
- [ ] Test purchase
- [ ] Test badge display
- [ ] Test expiry

---

## 9. Sprint 8: Admin & Moderation (Week 15-16)

### 9.1 Admin Dashboard v2

**Objective:** Enhanced admin insights

**Tasks:**
- [ ] Revenue metrics
- [ ] User growth chart
- [ ] Listing activity chart
- [ ] Recent disputes

**Testing:**
- [ ] Test data accuracy
- [ ] Test chart rendering

### 9.2 Content Moderation

**Objective:** Automated content filtering

**Tasks:**
- [ ] Auto-flag inappropriate images
- [ ] Auto-flag inappropriate titles
- [ ] Review queue
- [ ] Approve/remove with reason

**Testing:**
- [ ] Test flagging accuracy
- [ ] Test review flow

### 9.3 User Management v2

**Objective:** Enhanced user control

**Tasks:**
- [ ] User ban with reason
- [ ] Temporary suspension
- [ ] Appeal process
- [ ] User history

**Testing:**
- [ ] Test ban flow
- [ ] Test suspension
- [ ] Test appeal

### 9.4 System Settings

**Objective:** Platform configuration

**Tasks:**
- [ ] Maintenance mode
- [ ] Announcements
- [ ] Category management
- [ ] Fee settings

**Testing:**
- [ ] Test settings persistence
- [ ] Test feature flags

---

## 10. Sprint 9: Mobile & Performance (Week 17-18)

### 10.1 PWA Setup

**Objective:** Make app installable

**Tasks:**
- [ ] Configure manifest.json
- [ ] Register service worker
- [ ] Offline caching strategy
- [ ] Install prompt

**Testing:**
- [ ] Test install flow
- [ ] Test offline access

### 10.2 Image Optimization

**Objective:** Faster image loading

**Tasks:**
- [ ] WebP conversion on upload
- [ ] Responsive images (srcset)
- [ ] Lazy loading
- [ ] CDN for images

**Testing:**
- [ ] Test image quality
- [ ] Test load times
- [ ] Test mobile

### 10.3 Performance

**Objective:** Improve speed

**Tasks:**
- [ ] Next.js Image component
- [ ] API response caching
- [ ] Database query optimization
- [ ] Lighthouse score > 90

**Testing:**
- [ ] Test load times
- [ ] Test Core Web Vitals

### 10.4 Mobile UX

**Objective:** Better mobile experience

**Tasks:**
- [ ] Touch gestures
- [ ] Pull-to-refresh
- [ ] Bottom sheet for filters
- [ ] Haptic feedback

**Testing:**
- [ ] Test gesture recognition
- [ ] Test mobile navigation

---

## 11. Sprint 10: Polish & Launch Prep (Week 19-20)

### 11.1 Error Handling

**Objective:** Graceful error handling

**Tasks:**
- [ ] Global error boundary
- [ ] Standardized API errors
- [ ] User-friendly error pages

**Testing:**
- [ ] Test all error scenarios

### 11.2 Accessibility

**Objective:** Make app accessible

**Tasks:**
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Screen reader testing
- [ ] Color contrast

**Testing:**
- [ ] WCAG 2.1 AA compliance

### 11.3 Documentation

**Objective:** Complete documentation

**Tasks:**
- [ ] API documentation (Swagger)
- [ ] User guide (Filipino)
- [ ] Seller guide
- [ ] Admin guide

**Testing:**
- [ ] Test guide accuracy

### 11.4 Final QA

**Objective:** Ensure production readiness

**Tasks:**
- [ ] Full regression testing
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Load testing
- [ ] Security audit

**Testing:**
- [ ] All features pass
- [ ] No critical bugs

---

## 12. Testing Strategy

### Testing Per Sprint

| Sprint | Unit Tests | Integration Tests | E2E Tests | Manual QA |
|--------|-----------|-------------------|-----------|-----------|
| 1. Security | Auth functions, token generation | Registration + email flow | Full login/reset flow | Security checklist |
| 2. Payments | Payment service, escrow logic | GCash/Maya sandbox | Purchase flow | Payment scenarios |
| 3. Messaging | WebSocket events, message DB | Chat between users | Real-time conversation | Typing, delivery |
| 4. Notifications | Notification CRUD, email templates | Push notification flow | Receive all types | Notification center |
| 5. Verification | OTP generation, ID upload | Phone verify flow | Seller verification | Admin review |
| 6. Search | Search ranking, distance calc | Full search flow | Search + filters | Accuracy check |
| 7. Seller Tools | Analytics aggregation, CSV parse | Bulk import flow | Seller dashboard | All tools work |
| 8. Admin | Ban logic, moderation queue | Admin actions | Full admin workflow | All admin features |
| 9. Mobile | Image optimization, caching | PWA install | Mobile navigation | Device testing |
| 10. Polish | Error handling, a11y | Full regression | Complete user journey | Cross-browser |

### Test Commands

```bash
# Run all tests
node scripts/qa-test.js

# Run specific test category
node scripts/qa-test.js --filter "authentication"

# Run with verbose output
node scripts/qa-test.js --verbose
```

---

## 13. Timeline & Milestones

### Phase 2 Timeline

| Sprint | Duration | Dates | Milestone |
|--------|----------|-------|-----------|
| Sprint 1 | 2 weeks | Week 1-2 | Security foundation complete |
| Sprint 2 | 2 weeks | Week 3-4 | Payment system live |
| Sprint 3 | 2 weeks | Week 5-6 | Real-time messaging |
| Sprint 4 | 2 weeks | Week 7-8 | Notifications system |
| Sprint 5 | 2 weeks | Week 9-10 | Trust & verification |
| Sprint 6 | 2 weeks | Week 11-12 | Search & discovery |
| Sprint 7 | 2 weeks | Week 13-14 | Seller tools |
| Sprint 8 | 2 weeks | Week 15-16 | Admin & moderation |
| Sprint 9 | 2 weeks | Week 17-18 | Mobile & performance |
| Sprint 10 | 2 weeks | Week 19-20 | Polish & launch prep |

### Key Milestones

| Milestone | Target Date | Dependencies |
|-----------|-------------|--------------|
| Email verification live | Week 2 | Sprint 1 |
| GCash/Maya integration | Week 4 | Sprint 2 |
| Real-time messaging | Week 6 | Sprint 3 |
| Push notifications | Week 8 | Sprint 4 |
| Phone verification | Week 10 | Sprint 5 |
| Full-text search | Week 12 | Sprint 6 |
| Seller analytics | Week 14 | Sprint 7 |
| Admin v2 dashboard | Week 16 | Sprint 8 |
| PWA installable | Week 18 | Sprint 9 |
| Production launch | Week 20 | Sprint 10 |

### Resource Requirements

| Resource | Quantity | Purpose |
|----------|----------|---------|
| Developer | 1-2 | Full-time development |
| Designer | 1 | UI/UX improvements |
| QA Tester | 1 | Testing & QA |
| DevOps | 1 | Deployment & infrastructure |

### Budget Estimate

| Item | Cost | Frequency |
|------|------|-----------|
| Neon PostgreSQL | $0-25/mo | Monthly |
| Vercel | $0-20/mo | Monthly |
| Twilio (SMS) | $0.01/SMS | Per use |
| Resend (Email) | $0-20/mo | Monthly |
| Domain | $12/year | Yearly |
| **Total** | **$30-80/mo** | Monthly |

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Test Coverage | 50/50 | 100/100 |
| Lighthouse Score | ~70 | 90+ |
| Page Load Time | ~3s | <1s |
| API Response Time | ~500ms | <200ms |
| User Registration | Basic | Verified emails |
| Transactions | None | GCash/Maya |
| Real-time Features | None | WebSocket |
| Mobile Experience | Responsive | PWA |

---

**BAI & SIL** — Phase 2 Implementation Plan  
*Gawang Pinas, para sa Pinas*
