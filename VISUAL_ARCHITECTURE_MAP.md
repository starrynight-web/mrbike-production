# 📊 MrBikeBD - VISUAL SYSTEM ARCHITECTURE & ISSUE MAP

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         MrBikeBD System                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────────┐          ┌──────────────────────┐      │
│   │                  │          │                      │      │
│   │  FRONTEND        │◄────────►│  BACKEND (Django)    │      │
│   │  Next.js 16      │ REST API │  DRF                 │      │
│   │  React 19        │          │  Python 3.x          │      │
│   │  TypeScript      │          │                      │      │
│   │  Tailwind CSS    │          └──────────────────────┘      │
│   │                  │                     ▲                   │
│   └──────────────────┘                     │                   │
│                                            │                   │
│                    ┌───────────────────────┴──────────────┐   │
│                    │     DATA LAYER (DATABASES)          │   │
│                    │                                      │   │
│                    ├─ PostgreSQL (Users, Listings)      │   │
│                    ├─ MongoDB (Bikes, Articles)         │   │
│                    ├─ Redis (Cache, Sessions)           │   │
│                    └──────────────────────────────────────┘   │
│                                                                 │
│    ┌─────────────────────┐        ┌──────────────────────┐   │
│    │ Third-Party         │        │ Infrastructure       │   │
│    │ Services            │        │                      │   │
│    ├─ Google OAuth       │        ├─ Cloudinary (Images)│   │
│    ├─ Firebase (OTP)     │        ├─ Sentry (Errors)    │   │
│    ├─ SSLCommerz         │        ├─ Vercel (Frontend)  │   │
│    ├─ Twilio/SMS         │        ├─ DigitalOcean (BE)  │   │
│    └─────────────────────┘        └──────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Current System Status Map

```
┌──────────────────────────────────────────────────────────────┐
│                  COMPLETION STATUS                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  FRONTEND                                                    │
│  ████████████████████░░░░░  85%                              │
│  ✅ UI/UX Complete                                          │
│  ❌ API Integration (uses mock data)                        │
│  ❌ Authentication (NextAuth missing)                       │
│                                                              |
│  BACKEND - MODELS                                           │
│  ████████████████████░░░░░  90%                             │
│  ✅ User model                                             │
│  ✅ Bike models                                            │
│  ✅ Marketplace models                                     │
│  ✅ Interactions (Review, Wishlist)                        │
│  ❌ Some fields missing (resale_score, mileage filters)   │
│                                                              │
│  BACKEND - VIEWS/ENDPOINTS                                 │
│  ██████████░░░░░░░░░░░░░░  40%                            │
│  ⚠️  BikeViewSet (80%)                                     │
│  ⚠️  UsedBikeListing (60%)                                │
│  ❌ News endpoints (0%)                                    │
│  ❌ Recommendations (20%)                                  │
│  ❌ Similar bikes route (0%)                               │
│                                                              │
│  AUTHENTICATION                                             │
│  █████░░░░░░░░░░░░░░░░░░░  20%                            │
│  ⚠️  Google OAuth (40% - code exists, creds missing)      │
│  ❌ JWT (disabled in settings)                             │
│  ❌ Phone OTP (0%)                                         │
│  ❌ NextAuth.js (0%)                                       │
│                                                              │
│  DATABASE & CACHING                                         │
│  ██░░░░░░░░░░░░░░░░░░░░░░  10%                            │
│  ❌ SQLite (should be PostgreSQL)                          │
│  ❌ 0 bikes imported                                        │
│  ❌ MongoDB not connected                                  │
│  ❌ Redis not integrated                                   │
│                                                              │
│  INTEGRATIONS                                               │
│  ░░░░░░░░░░░░░░░░░░░░░░░░  5%                             │
│  ❌ Cloudinary                                              │
│  ❌ Firebase                                                │
│  ❌ Sentry                                                  │
│  ❌ SSLCommerz                                              │
│                                                              │
│  OVERALL SYSTEM: ██████████░░░░░░░░░░░░  35%              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Issue Distribution by Layer

```
┌────────────────────────────────────────────────────────────────┐
│                    ISSUE DISTRIBUTION                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  CRITICAL 🔴 (20 issues)                                     │
│  ├─ Database: SQLite, no data (4)                            │
│  ├─ Auth: JWT disabled, OAuth incomplete (4)                 │
│  ├─ APIs: Missing URL files, incomplete routes (4)           │
│  ├─ Integration: Frontend-backend disconnect (4)             │
│  └─ Build: TypeScript errors block production (4)            │
│                                                                │
│  HIGH 🟡 (28 issues)                                         │
│  ├─ Endpoint implementations (8)                             │
│  ├─ Third-party integrations (8)                             │
│  ├─ Frontend features (6)                                     │
│  ├─ Business logic (6)                                        │
│                                                                │
│  MEDIUM 🟢 (20 issues)                                        │
│  ├─ Schema improvements (6)                                   │
│  ├─ Error handling (5)                                        │
│  ├─ Performance optimization (5)                              │
│  ├─ Testing setup (4)                                         │
│                                                                │
│  LOW 🔵 (19 issues)                                           │
│  ├─ Documentation (4)                                         │
│  ├─ Code style (5)                                            │
│  ├─ Nice-to-have features (10)                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Frontend-Backend API Connection Status

```
┌─────────────────────────────────┬──────────────────────────┐
│ Frontend Expects                │ Backend Provides         │
├─────────────────────────────────┼──────────────────────────┤
│ GET /api/bikes                  │ ❌ /api/bikes/models/    │
│ GET /api/bikes/{slug}           │ ⚠️ /api/bikes/models/..  │
│ GET /api/bikes/{slug}/similar   │ ❌ NOT IMPLEMENTED       │
│ POST /api/auth/google           │ ⚠️ Missing GOOGLE_ID     │
│ POST /api/auth/verify-phone     │ ❌ NOT IMPLEMENTED       │
│ GET /api/news                   │ ❌ NO URL ROUTE          │
│ GET /api/news/{slug}            │ ❌ NO URL ROUTE          │
│ GET /api/marketplace/listings   │ ⚠️ Incomplete            │
│ POST /api/marketplace/listings  │ ⚠️ Incomplete            │
│ GET /api/interactions/wishlist  │ ⚠️ Incomplete            │
│ POST /api/wishlist/toggle/{id}  │ ⚠️ Missing route         │
│ GET /api/recommendations        │ ❌ NOT IMPLEMENTED       │
│ GET /api/reviews                │ ⚠️ Incomplete            │
│ POST /api/reviews               │ ⚠️ Incomplete            │
└─────────────────────────────────┴──────────────────────────┘

Legend:
✅ = Fully working
⚠️ = Partially working (needs fixes)
❌ = Not implemented at all
```

---

## Data Flow (Current vs Required)

```
CURRENT STATE (BROKEN):
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Frontend                    Backend                   │
│  ┌────────────────┐          ┌─────────────────┐      │
│  │ Home page      │          │ Django Server   │      │
│  │ Static JSON    │────X───► │ (Not connected) │      │
│  │ Mock data      │          │                 │      │
│  │ No real calls  │          │ Empty Database  │      │
│  └────────────────┘          └─────────────────┘      │
│                                     │                  │
│  Result: UI only, no data, no features                │
│                                                          │
└──────────────────────────────────────────────────────────┘

REQUIRED STATE (WORKING):
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Frontend                    Backend        Database   │
│  ┌────────────────┐          ┌──────────┐   ┌────────┐│
│  │ Home page      │   REST   │ Django   │   │ Bikes  ││
│  │ API calls      │◄────────►│ APIs     │◄──┤ Users  ││
│  │ Real data      │   JSON   │ Services │   │ News   ││
│  │ Loading states │          │          │   └────────┘│
│  └────────────────┘          └──────────┘             │
│                                                          │
│  Result: Full features, persistent data, works        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Implementation Timeline

```
WEEK 1: FOUNDATION
├─ Mon: Database migration (SQLite → PostgreSQL)
│       Time: 2h | Status: 🔴 CRITICAL
├─ Tue: Data import (300 bikes)
│       Time: 1h | Status: 🔴 CRITICAL
├─ Tue: Authentication setup (JWT, Google OAuth)
│       Time: 3h | Status: 🔴 CRITICAL
├─ Wed: URL routing completion
│       Time: 1h | Status: 🔴 CRITICAL
├─ Wed: OTP service implementation
│       Time: 2h | Status: 🟡 HIGH
└─ Thu: Basic endpoint testing
        Time: 2h | Status: 🟡 HIGH

WEEK 2: INTEGRATION
├─ Mon: Frontend TypeScript fixes
│       Time: 1h | Status: 🟡 HIGH
├─ Mon: NextAuth.js setup
│       Time: 2h | Status: 🟡 HIGH
├─ Tue: API connection in frontend
│       Time: 2h | Status: 🟡 HIGH
├─ Tue: Replace mock data
│       Time: 2h | Status: 🟡 HIGH
├─ Wed: Business logic (recommendations, etc)
│       Time: 3h | Status: 🟡 HIGH
├─ Wed: Image upload integration
│       Time: 2h | Status: 🟡 HIGH
├─ Thu: Testing & bug fixes
│       Time: 4h | Status: 🟢 MEDIUM
└─ Fri: Deployment setup
        Time: 2h | Status: 🟢 MEDIUM

TOTAL TIME: 32-40 hours
DAYS: 7-10 (working full-time)
```

---

## Database Schema Status

```
PostgreSQL (Primary Database)
├─ ✅ Users
│  ├─ email (unique)
│  ├─ phone (optional)
│  ├─ is_phone_verified
│  ├─ role (user/seller/dealer/admin)
│  └─ profile_image
│
├─ ⚠️ BikeModel (MISSING FIELDS)
│  ├─ ✅ name, brand, category
│  ├─ ✅ engine_capacity, price
│  ├─ ❌ resale_score (missing)
│  ├─ ❌ mileage (missing)
│  └─ ❌ fuel_efficiency (missing)
│
├─ ✅ UsedBikeListing
│  ├─ seller, bike_model
│  ├─ price, mileage, condition
│  ├─ images (ListingImage FK)
│  └─ status, is_verified
│
├─ ✅ Review
│  ├─ bike, user
│  ├─ rating, comment
│  ├─ is_verified_purchase
│  └─ ❌ Missing: title, pros/cons
│
├─ ✅ Wishlist
│  ├─ user (OneToOne)
│  └─ bikes (M2M)
│
├─ ✅ Article
│  ├─ title, slug, content
│  ├─ author, category
│  ├─ tags (M2M)
│  └─ is_published
│
└─ ✅ UserProfile
   ├─ user (OneToOne)
   ├─ points, member_since
   └─ is_dealer

MongoDB (Secondary - Flexible)
├─ ❌ Not connected
├─ ❌ No collections
└─ Purpose: Bike specs, news metadata
```

---

## Endpoint Implementation Map

```
✅ = Fully implemented
⚠️ = Partially implemented  
❌ = Not implemented

BIKES ENDPOINTS
✅ GET    /api/bikes/models/                 (list all)
✅ GET    /api/bikes/models/{id}/            (detail by ID)
⚠️ GET    /api/bikes/models/{slug}/          (detail by slug)
❌ GET    /api/bikes/models/{slug}/similar/  (similar bikes)
✅ GET    /api/bikes/brands/                 (list brands)

USERS ENDPOINTS
⚠️ POST   /api/users/auth/google/            (login)
❌ POST   /api/users/auth/otp/send/          (send OTP)
❌ POST   /api/users/auth/verify-phone/      (verify OTP)
❌ GET    /api/users/me/                     (current user)
❌ GET    /api/users/me/profile/             (user profile)
❌ PUT    /api/users/me/profile/             (update profile)

MARKETPLACE ENDPOINTS
❌ GET    /api/marketplace/listings/         (list all)
❌ POST   /api/marketplace/listings/         (create new)
❌ GET    /api/marketplace/listings/{id}/    (detail)
❌ PUT    /api/marketplace/listings/{id}/    (update)
❌ DELETE /api/marketplace/listings/{id}/    (delete)

NEWS ENDPOINTS
❌ GET    /api/news/                         (list articles)
❌ GET    /api/news/{slug}/                  (article detail)
❌ POST   /api/news/                         (create article - admin)

INTERACTIONS ENDPOINTS
⚠️ GET    /api/interactions/wishlist/        (get wishlist)
❌ POST   /api/interactions/wishlist/        (add to wishlist)
❌ DELETE /api/interactions/wishlist/{id}/   (remove from wishlist)
⚠️ GET    /api/interactions/bikes/{id}/reviews/     (reviews)
❌ POST   /api/interactions/reviews/         (create review)

RECOMMENDATIONS ENDPOINTS
❌ GET    /api/recommendations/similar/{slug}/ (similar bikes)
❌ GET    /api/recommendations/browsing/     (based on history)
```

---

## Critical Path to MVP Launch

```
Day 1-2: Database
  ├─ PostgreSQL setup         🔴 BLOCKER
  └─ Bike data import         🔴 BLOCKER
     └──► Frontend can show data

Day 3: Authentication  
  ├─ JWT enable               🔴 BLOCKER
  ├─ Google OAuth creds       🔴 BLOCKER
  └─ NextAuth setup          
     └──► Login works

Day 4: URL Routing
  ├─ Create news/urls.py      🔴 BLOCKER
  ├─ Create marketplace/urls   🔴 BLOCKER
  └─ Register all routes      
     └──► All endpoints accessible

Day 5: Integration
  ├─ Connect frontend APIs    🟡 HIGH
  ├─ Fix TypeScript           🟡 HIGH
  └─ Replace mock data       
     └──► Frontend calls real APIs

Day 6-8: Features
  ├─ OTP service             🟡 HIGH
  ├─ Image upload            🟡 HIGH
  ├─ Recommendations         🟡 HIGH
  └─ Search/filters          
     └──► Core features work

Day 9-10: Deployment
  ├─ Backend → DigitalOcean  🟢 MEDIUM
  ├─ Frontend → Vercel       🟢 MEDIUM
  └─ Domain & SSL           
     └──► Live on production
```

---

## File Tree: What Needs to Be Done

```
backend/
├─ apps/
│  ├─ users/
│  │  ├─ views.py              ⚠️ Add OTP views
│  │  ├─ urls.py               ⚠️ Register OTP routes
│  │  ├─ services/             ❌ CREATE FOLDER
│  │  │  └─ otp_service.py    ❌ CREATE
│  │  └─ serializers.py        ✅ Done
│  │
│  ├─ bikes/
│  │  ├─ views.py              ⚠️ Add similar endpoint
│  │  ├─ serializers.py        ✅ Done
│  │  └─ urls.py               ⚠️ Add similar route
│  │
│  ├─ marketplace/
│  │  ├─ urls.py               ❌ CREATE
│  │  ├─ views.py              ⚠️ Image handling
│  │  └─ serializers.py        ⚠️ Image serializer
│  │
│  ├─ news/
│  │  ├─ urls.py               ❌ CREATE ← CRITICAL
│  │  ├─ views.py              ⚠️ Improve views
│  │  └─ serializers.py        ✅ Done
│  │
│  ├─ interactions/
│  │  ├─ urls.py               ⚠️ Complete
│  │  ├─ views.py              ⚠️ Complete
│  │  └─ serializers.py        ✅ Done
│  │
│  └─ recommendations/
│     ├─ urls.py               ❌ CREATE
│     ├─ views.py              ❌ CREATE
│     ├─ serializers.py        ❌ CREATE
│     └─ engine.py             ⚠️ Done
│
├─ core/
│  ├─ settings.py              ⚠️ Enable JWT, add DB
│  ├─ urls.py                  ⚠️ Register all apps
│  └─ wsgi.py                  ✅ Done
│
├─ scripts/
│  ├─ migrate_bikes.py         ⚠️ Test & run
│  └─ generate_apis.py         ❌ Optional
│
├─ .env                        ⚠️ Add credentials
├─ requirements.txt            ✅ Done
└─ manage.py                   ✅ Done

frontend/
├─ src/
│  ├─ app/
│  │  ├─ api/auth/[...nextauth]/
│  │  │  └─ route.ts          ❌ CREATE ← CRITICAL
│  │  │
│  │  ├─ bikes/
│  │  │  └─ catalogue-client.tsx ⚠️ Fix TypeScript
│  │  │
│  │  ├─ page.tsx             ⚠️ Connect APIs
│  │  ├─ layout.tsx           ⚠️ Add auth provider
│  │  └─ [other pages]/       ⚠️ Replace mock data
│  │
│  ├─ lib/
│  │  ├─ api.ts               ✅ Exists
│  │  └─ api-service.ts       ⚠️ Connect properly
│  │
│  ├─ providers/
│  │  ├─ auth-provider.tsx    ⚠️ Complete
│  │  └─ query-provider.tsx   ✅ Done
│  │
│  └─ config/
│     └─ constants.ts         ✅ Done
│
├─ .env.local                 ⚠️ Add API_URL
└─ package.json               ✅ Done
```

---

## Success Metrics Tracker

```
METRIC                          CURRENT    TARGET    STATUS
────────────────────────────────────────────────────────
Frontend Build Success           ❌         ✅        
API Endpoints Working            20%        95%       
Bikes in Database                0          300+      
Login Working                    ❌         ✅        
Phone Verification               ❌         ✅        
Similar Bikes Showing            ❌         ✅        
Wishlist Functional              ❌         ✅        
Used Bikes Marketplace           10%        90%       
News Articles Loading            ❌         ✅        
Image Upload Working             ❌         ✅        
Frontend-Backend Connected       0%         100%      
Deployment Ready                 ❌         ✅        
```

---

**Created:** 2026-02-02 | **Reference:** Complete System Analysis | **Last Update:** Analysis Complete
