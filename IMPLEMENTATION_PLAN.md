# MrBikeBD — Complete Engineering Implementation Roadmap

## Audit Summary

**Frontend:** Next.js 16 (App Router, SSR + CSR hybrid) | **Backend:** Django 4.2 + DRF | **DBs:** Supabase PostgreSQL (primary) + MongoDB Atlas (legacy – still partially in use) | **Images:** Cloudinary SDK | **Email:** Brevo (`sib_api_v3_sdk`) | **Auth:** JWT (SimpleJWT) + Google OAuth + TOTP 2FA | **Cache:** Redis Cloud | **Queue:** Django-Q2 | **Hosting:** Contabo (backend), Vercel (frontend)

---

## PART A — FULL AUDIT FINDINGS

### 1. Architecture Overview

```
Browser
  │
  ▼
Next.js 16 (Vercel) ─── REST API calls ──▶ Django 4.2 (Gunicorn/Contabo)
  │                                              │
  │                                              ├─ Supabase PostgreSQL (primary DB)
  │                                              ├─ MongoDB Atlas (legacy – analytics only)
  │                                              ├─ Redis Cloud (cache + Django-Q tasks)
  │                                              └─ Cloudinary (image CDN)
  │
  └─ Zustand stores (client state)
  └─ React Query (server-state cache)
```

**Django Apps:**
| App | Purpose |
|-----|---------|
| `apps.users` | Auth, profiles, notifications, email verification |
| `apps.bikes` | Brand, BikeModel, BikeVariant, BikeSpecification |
| `apps.marketplace` | UsedBikeListing, ListingImage, ReportListing |
| `apps.interactions` | Review, Wishlist, WishlistItem, Inquiry |
| `apps.news` | Article CMS |
| `apps.core` | Admin views, permissions, rate limits, responses |

**Frontend Pages (Next.js App Router):**
`/`, `/bikes`, `/bike/[slug]`, `/brands/[brand]`, `/used-bikes`, `/used-bike/[slug]`, `/sell-bike`, `/profile`, `/admin/*`, `/news`, `/login`, `/register`, `/verify-email`, `/compare`, `/sitemap.ts`, `/robots.ts`

---

### 2. Root Cause Analysis — All Known Bugs

#### BUG-001: Email Not Reaching Gmail (Critical)

**Root cause identified:**
- `email_service.py` line 17: `self.api_key = os.getenv("BREVO_API_KEY", "")` — **The key stored in `.env` is the Brevo HTTP REST API key, but the code uses `sib_api_v3_sdk` which is the official Brevo Python SDK. This is correct.**
- **However:** `base.py` lines 162–167 configure Django's standard SMTP email backend pointing to `smtp-relay.brevo.com:587` with `EMAIL_HOST_USER = os.getenv('BREVO_SMTP_USER', '')`. The env file has **NO** `BREVO_SMTP_USER` variable defined — it is empty string. SMTP authentication therefore silently fails.
- The `email_service.py` itself uses the SDK (not SMTP), so `send_email()` via SDK should theoretically work. But the SDK's API key value in `.env` has format: `xkeysib-xsmtpsib-...` — this is a **SMTP key prefix**, not the standard v3 REST API key. Brevo REST API keys start with `xkeysib-` only (without the `xsmtpsib` substring). **The key appears to be a combined legacy key format that may not authenticate properly with `sib_api_v3_sdk`.**
- Additionally: the `DEFAULT_FROM_EMAIL` is `testing-brevo@mrbikebd.com` — this domain must be verified and authenticated (DKIM/SPF) in Brevo dashboard. If the domain is not verified, Brevo silently drops all outgoing mail.
- **Secondary issue:** Email templates rendered via `render_to_string('emails/verify_email.html', ...)` — the `templates/` folder must contain these HTML files. If they are missing, Django raises `TemplateDoesNotExist`, the exception is caught at line 168–170 in `views.py`, `email_sent` is set to `False`, but the API returns HTTP 201 anyway → frontend shows "success" even though no email was sent.

#### BUG-002: Cloudinary Images Not Appearing on Site

**Root cause identified:**
- `BikeModel` in `bikes/models.py` uses `CloudinaryField` for `primary_image`, `image1`–`image5`. Cloudinary SDK stores images as `CloudinaryResource` objects, which serialize to a **public_id string** (e.g., `mrbikebd/official-bikes/abc123`) not a full URL.
- The DRF serializer for `BikeModel` likely returns just the public_id string for image fields. The Next.js frontend then tries to use this as a `src` prop in `<Image>` which fails because it is not a valid URL.
- The `detail-client.tsx` line 459 shows it uses `bike.primary_image` or `/placeholder-bike.png` as fallback — if `primary_image` is a raw Cloudinary public_id string rather than `https://res.cloudinary.com/...`, the image silently fails.
- Fix requires serializer serialization of `CloudinaryField` to return the full HTTPS URL using `cloudinary.utils.cloudinary_url()` or `build_url()`.

#### BUG-003: Review Submission Fails

**Root cause identified:**
- `interactions/models.py` line 22: `unique_together = ('bike_model', 'user')` — this constraint is correct (1 review per user per bike).
- The review submission likely fails because of **authentication token not being sent** or **403 from the email verification check**. Users who registered but haven't verified email cannot post reviews (email verification enforces this in marketplace `perform_create`).
- Also: if `useSubmitReview` hook in the frontend sends `bike_model` as the slug rather than the integer PK, the API will return a 400 or 404 error.

#### BUG-004: Brand Filter Not Sorting Correctly

**Root cause identified:**
- `BikeModel.Meta.ordering = ['-popularity_score', 'name']` — bikes are ordered by popularity score globally. The brand filter page applies additional filtering but inherits this ordering. If popularity scores are all 0 (default), bikes appear in random/insert order within the name grouping.
- The frontend brand filter page likely calls `/api/v1/bikes/?brand_slug=yamaha` but the bike serializer may return `brand` as an object vs `brand_slug` as a string — causing filter mismatch.

#### BUG-005: Admin Panel — New Bikes Not Appearing

**Root cause identified:**
- Bikes added via admin panel are saved to the DB, but the frontend uses React Query with stale-time caching. If cache is not invalidated after bike creation, the frontend displays stale data.
- Also, images uploaded via Django admin use `CloudinaryField` but if the serializer returns public_ids instead of URLs, the frontend image rendering fails causing cards to show blank images even though the bike record exists.

#### BUG-006: Used Bike System Partially Broken

**Root cause identified:**
- The `approve` and `reject` actions in `marketplace/views.py` use `IsSuperAdminOnly` permission — only superadmins can moderate listings. If the admin account used for moderation is role=`admin` but not `is_superuser=True`, the permission check fails with 403.
- The `my_listings` endpoint works but requires authentication. Frontend may be sending expired JWT tokens.

#### BUG-007: Profile Center Not Fully Integrated

**Root cause identified:**
- `UserDashboardStatsView` returns `listings_count`, `wishlist_count`, `reviews_count`. But `UserProfileView` returns user fields from the User model, not the UserProfile model. The `UserProfile` model has `points` and `member_since` but these are not included in `UserSerializer`.
- No endpoint exists to fetch all user's active listings (other than `/marketplace/listings/my_listings/`), user's reviews joined with bike data, or user's wishlist with bike details in one call.

---

### 3. Database Architecture — Current State

**PostgreSQL tables (Supabase):**
- `users_user`, `users_emailverificationtoken`, `users_userprofile`, `users_notification`
- `bikes_brand`, `bikes_bikemodel`, `bikes_bikevariant`, `bikes_bikespecification`
- `marketplace_usedbike listing`, `marketplace_listingimage`, `marketplace_reportlisting`
- `interactions_review`, `interactions_wishlist`, `interactions_wishlistitem`, `interactions_inquiry`
- `news_article` (assumed)
- `django_q_*` (task queue)
- `token_blacklist_*` (JWT blacklist)

**MongoDB Atlas (legacy):** Only referenced in commented-out `DATABASE_ROUTERS` line. The `.env` still has `MONGODB_URI` configured. As of recent conversation history, the platform is exclusively on PostgreSQL. MongoDB should be removed from `.env` and `requirements.txt`.

**Missing MongoDB library:** `djongo` was used previously but is not in `requirements.txt` — removed in a past migration. `pymongo` is also absent. MongoDB is dead code.

---

### 4. Dependency Analysis

**Backend — Unused:**
- `pyotp`, `qrcode` (2FA — implemented but may not be used in production flow)
- `firebase` references in `.env` — no Firebase SDK in `requirements.txt` (correct, it's placeholder)
- `sslcommerz` variables in `.env` — no SDK (placeholder)

**Frontend — Potentially Unused:**
- `next-auth` — JWT auth is handled manually via SimpleJWT + Zustand store. `next-auth` creates confusion/overlap.
- `hugeicons-react` — appears alongside `lucide-react`. Likely only one is actively used.
- `@tanstack/react-query-devtools` — dev dependency mixed into main `dependencies`

---

## PART B — IMPLEMENTATION PLAN

---

## PHASE 1 — Critical System Fixes

**Goal:** Fix all broken core features. Platform must be functionally correct after this phase.

---

### 1.1 — Email System (Brevo) Fix

**Problem:** Emails are not reaching Gmail.

**Tasks:**

**A. Verify and regenerate Brevo API key**
1. Log into Brevo dashboard → Settings → API Keys
2. Create a new API key under the v3 REST API section
3. The correct format is: `xkeysib-[64 hex chars]` (no `xsmtpsib` substring)
4. Update `BREVO_API_KEY` in `backend/.env`

**B. Verify sender domain authentication**
1. In Brevo dashboard → Senders & IPs → Authenticate a domain
2. Add DNS records for `mrbikebd.com`: SPF, DKIM, DMARC
3. Use the Brevo built-in domain checker to confirm propagation
4. Alternatively: use a Brevo-provided `@sendinblue.com` sender for testing

**C. Fix missing `BREVO_SMTP_USER` env variable**
- **File:** `backend/.env`
- Add: `BREVO_SMTP_USER=your-brevo-account-login-email@domain.com`
- This is only needed if using SMTP backend. Since email service uses SDK, this line can be removed from `base.py` if SMTP is confirmed unused.

**D. Audit email template files**
- **File path:** `backend/templates/emails/`
- Verify these files exist: `verify_email.html`, `reset_password.html`, `welcome_email.html`, `rejection_email.html`, `approval_email.html`
- If any are missing, create them. Each must be valid Django templates with `{{ name }}` and the relevant URL variable.

**E. Add email diagnostic endpoint**
- **File:** `backend/apps/users/admin_views.py`
- Add a POST endpoint `/api/v1/admin/test-email/` (staff-only) that sends a test email to the authenticated user's email address and returns the Brevo API response body for debugging.

**Expected result:** Verification email arrives in Gmail within 30 seconds of registration.

**Testing checklist:**
- [ ] Register a new account with a real Gmail address
- [ ] Check that `email_sent: true` in the API response
- [ ] Confirm email arrives in inbox (not spam)
- [ ] Click verification link → account is marked `is_email_verified = True`
- [ ] Call `/api/v1/admin/test-email/` as staff → check Django logs for `Message ID`

---

### 1.2 — Cloudinary Image Fix

**Problem:** Images upload but do not appear on the site.

**Tasks:**

**A. Fix `BikeModelSerializer` to return full Cloudinary URLs**
- **File:** `backend/apps/bikes/serializers.py`
- For each `CloudinaryField` (`primary_image`, `image1`–`image5`, `logo`), override the `to_representation` method or use a `SerializerMethodField`:

```python
# In BikeModelSerializer:
primary_image = serializers.SerializerMethodField()

def get_primary_image(self, obj):
    if obj.primary_image:
        return cloudinary.utils.cloudinary_url(str(obj.primary_image), secure=True)[0]
    return None
```

Apply same pattern to `image1`–`image5`, `Brand.logo`, and `ListingImage` fields.

**B. Fix `ListingImageSerializer`**
- **File:** `backend/apps/marketplace/serializers.py`
- The `get_best_url` property on `ListingImage` model exists but must be exposed via serializer.
- Add `SerializerMethodField` for `url` that calls `instance.get_best_url`.

**C. Fix Next.js `next.config.ts` image domains**
- **File:** `frontend/next.config.ts`
- Verify `res.cloudinary.com` is listed in `images.remotePatterns`:

```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'res.cloudinary.com' },
  ],
}
```

**D. Fix frontend image rendering in `detail-client.tsx`**
- **File:** `frontend/src/app/bike/[slug]/detail-client.tsx`
- Lines 701–707: The main image uses `defaultImage = bike?.primary_image || "/placeholder-bike.png"`. Once serializer returns full URL this will work automatically.
- Lines 756–761: Thumbnails loop `Array.from({ length: IMAGE_COUNT })` using the same `defaultImage` for all thumbnails. Fix to map over `[bike.primary_image, bike.image1, bike.image2, bike.image3, bike.image4, bike.image5].filter(Boolean)`.

**E. Add Cloudinary admin diagnostic**
- In Django admin or test endpoint: upload a test image and log the full Cloudinary response object to confirm `secure_url` is returned.

**Expected result:** Bike images load on all pages from Cloudinary CDN.

**Testing checklist:**
- [ ] Add a bike from admin panel with 3 images
- [ ] Confirm API response contains `https://res.cloudinary.com/duna87jkw/...` URLs (not raw public_ids)
- [ ] Bike card shows image on `/bikes` listing page
- [ ] Bike detail page shows all images in carousel
- [ ] Used bike listing shows uploaded images

---

### 1.3 — Review Submission Fix

**Problem:** Users cannot submit reviews.

**Tasks:**

**A. Debug the `useSubmitReview` hook**
- **File:** `frontend/src/hooks/use-bikes.ts`
- Confirm the POST body sends `{ bike_model: <integer_id>, rating: 1-5, comment: "..." }` using the numeric `bike.id`, not the slug

**B. Return `bike.id` from API to frontend**
- Confirm `BikeModel` serializer returns `id` as an integer field

**C. Fix permission for review submission**
- **File:** `backend/apps/interactions/views.py`
- Ensure `ReviewViewSet.create` only requires `IsAuthenticated` (not email-verified for reviews — or add a clear error)
- Add `unique_together` violation handling: return `HTTP 409 Conflict` with message "You have already reviewed this bike" instead of a 500 error

**D. Add error toast on frontend**
- **File:** `frontend/src/app/bike/[slug]/detail-client.tsx`
- The review form submission should display a `sonner` toast with the exact error message from the API

**Expected result:** Authenticated users can submit exactly one review per bike.

**Testing checklist:**
- [ ] Login as a regular (email-verified) user
- [ ] Navigate to any bike detail page
- [ ] Submit a review with rating 4 and comment
- [ ] Confirm review appears in the reviews list
- [ ] Try to submit a second review → should show "already reviewed" error
- [ ] Logout and confirm review form is hidden or prompts login

---

### 1.4 — Brand Filter Fix

**Problem:** Brands page not filtering/sorting bikes correctly.

**Tasks:**

**A. Fix bike filter queryset**
- **File:** `backend/apps/bikes/views.py`
- Confirm filter uses `brand__slug` not `brand_name`
- Add `brand__slug` to `filterset_fields`

**B. Fix popularity ordering**
- When filtering by brand, use secondary sort `price` or `name` (not popularity_score which defaults to 0 for all bikes)
- Apply: `queryset.filter(brand__slug=brand_slug).order_by('price')`

**C. Fix brands API endpoint**
- **File:** `backend/apps/bikes/views.py`
- Add endpoint `GET /api/v1/bikes/brands/` returning all brands with bike counts

**D. Frontend brand page**
- **File:** `frontend/src/app/brands/[brand]/page.tsx`
- Ensure API call passes `brand__slug` filter parameter, not `brand`

**Expected result:** All 22 brands filter bikes correctly. Bikes are sorted by price within each brand. Brands with no bikes are still shown with count 0.

**Testing checklist:**
- [ ] Visit `/brands/yamaha` → only Yamaha bikes shown
- [ ] Visit `/brands/ktm` → KTM bikes shown
- [ ] Visit `/brands/vespa` → Vespa bikes shown (even if 0 results)

---

## PHASE 2 — Database Consolidation (MongoDB Retirement)

**Goal:** Remove all MongoDB references. Platform runs on PostgreSQL only.

---

### 2.1 — Remove MongoDB from Codebase

**Affected files:**
- `backend/.env` — Remove `MONGODB_URI`, `MONGODB_DATABASE`, `MONGODB_USERNAME`, `MONGODB_PASSWORD`, `MONGODB_CLUSTER`
- `backend/.env.example` — Remove same
- `backend/core/db_routers.py` — Delete file (router is already commented out)
- `backend/core/settings/base.py` — Remove commented-out `DATABASE_ROUTERS` line
- Root `.env.example` — Remove MongoDB variables

**Tasks:**
1. Verify no Python file imports `pymongo`, `djongo`, or `motor`
2. Run: `grep -r "mongodb\|pymongo\|djongo\|motor" backend/ --include="*.py"` — should return no results
3. Remove `MONGODB_*` from all `.env` files

**Expected result:** Clean codebase with single database. Startup is faster, no connection errors.

---

### 2.2 — PostgreSQL Schema Optimization

**Goal:** Add missing indexes and optimize existing tables.

**New migration:** `backend/apps/bikes/migrations/000X_optimize_indexes.py`

```python
# Add composite indexes for common query patterns
operations = [
    migrations.AddIndex(
        model_name='bikemodel',
        index=models.Index(fields=['brand', 'category', 'is_available'], name='bike_brand_cat_avail_idx'),
    ),
    migrations.AddIndex(
        model_name='bikemodel',
        index=models.Index(fields=['price', 'engine_capacity'], name='bike_price_cc_idx'),
    ),
    # SEO slug lookup
    migrations.AddIndex(
        model_name='bikemodel',
        index=models.Index(fields=['slug'], name='bike_slug_idx'),
    ),
]
```

**Add missing SEO fields to `BikeModel`:**
```python
meta_title = models.CharField(max_length=160, blank=True, null=True)
meta_description = models.CharField(max_length=320, blank=True, null=True)
meta_keywords = models.CharField(max_length=500, blank=True, null=True)
launch_date = models.DateField(null=True, blank=True)
discontinue_date = models.DateField(null=True, blank=True)
```

**Add missing fields to `UsedBikeListing`:**
```python
whatsapp_number = models.CharField(max_length=20, blank=True, null=True)
phone_number = models.CharField(max_length=20, blank=True, null=True)
```
*(Note: `contact_number` already exists — rename or add dedicated WhatsApp field)*

**Full optimized schema reference:**

| Table | Key Fields | Critical Indexes |
|-------|-----------|----------------|
| `bikes_brand` | name, slug, logo, is_popular | slug UNIQUE |
| `bikes_bikemodel` | brand_fk, slug, category, price, engine_capacity, images×6, SEO fields | slug, brand+category+available |
| `bikes_bikevariant` | bike_model_fk, variant_key, price, color_options, features, mileage, topspeed | bike_model+is_default |
| `bikes_bikespecification` | bike_model OneToOne, 40+ spec fields | bike_model |
| `users_user` | email, role, is_email_verified, whatsapp_number, profile_image | email UNIQUE |
| `users_emailverificationtoken` | user_fk, token UUID, expires_at, used | token UNIQUE, user+used |
| `users_userprofile` | user OneToOne, points, is_dealer | user |
| `users_notification` | user_fk, title, message, is_read | user+is_read |
| `marketplace_usedbike` | seller_fk, bike_model_fk, slug, status, price, mileage, location, contact | status+created_at, price, seller |
| `marketplace_listingimage` | listing_fk, original_image, webp_image, is_primary, order | listing+order |
| `marketplace_reportlisting` | listing_fk, user_fk, reason | listing |
| `interactions_review` | bike_model_fk, user_fk, rating, comment | bike_model+user UNIQUE |
| `interactions_wishlist` | user OneToOne | user |
| `interactions_wishlistitem` | wishlist_fk, bike_model_fk | wishlist+bike_model UNIQUE |
| `news_article` | title, slug, author_fk, is_published, published_at | slug, is_published+published_at |

---

## PHASE 3 — Feature Completion

---

### 3.1 — Used Bike Marketplace — Full Moderation System

**Fix admin moderation permissions:**
- **File:** `backend/apps/marketplace/views.py`
- `approve` and `reject` actions currently require `IsSuperAdminOnly`. Change to require `IsAdminUser` (is_staff=True) so moderators can moderate listings.
- This was likely the cause of 403 errors during admin moderation.

```python
# views.py — change permission for approve/reject
elif self.action in ['approve', 'reject']:
    return [IsAdminUser()]  # Was: [IsSuperAdminOnly()]
```

**Add "View Full Details" endpoint for admin:**
- **File:** `backend/apps/marketplace/views.py`
- Existing `retrieve` action with `?status=all` for staff already returns full detail. Confirm the frontend admin panel is using this correctly.

**Admin moderation dashboard UI:**
- **File:** `frontend/src/app/admin/marketplace/page.tsx`
- Must show pending listings with:
  - Listing title, seller name, price, location, date posted
  - ⚠️ caution icon + report count if `reports.count > 0`
  - "View Full Details" button → opens modal with all fields + images
  - "Approve" and "Reject" buttons
  - Reject requires a reason input (textarea)

**Report count in admin listing:**
- **File:** `backend/apps/marketplace/serializers.py`
- Add `reports_count = serializers.IntegerField(source='reports.count', read_only=True)` to `UsedBikeListingSerializer`

---

### 3.2 — Admin Panel Data Flow Fixes

**New bikes appearing immediately:**
- **File:** `frontend/src/hooks/use-bikes.ts`
- After creating a bike, call `queryClient.invalidateQueries(['bikes'])` to force re-fetch
- Set `staleTime: 0` for admin-context queries

**Bike deletion:**
- Backend DELETE endpoint already exists via ModelViewSet
- Frontend admin must call `DELETE /api/v1/bikes/<id>/` then invalidate query

**News publishing:**
- **File:** `backend/apps/news/views.py`
- Confirm `is_published` field can be toggled via PATCH with `IsAdminUser` permission. If CSRF is blocking, confirm `CSRF_COOKIE_HTTPONLY = True` is compatible with JavaScript fetch (it should be — `HTTPONLY` prevents JS reading, not sending)

**Image upload admin improvement:**
- **Backend:** `BikeModel` already has `image1`–`image5` fields + `primary_image` (6 total)
- **Frontend admin form:** Ensure there are 6 separate image upload inputs labeled "Primary Image", "Image 2", "Image 3", "Image 4", "Image 5", "Image 6"
- Each input uploads independently to Cloudinary via `POST /api/v1/bikes/<id>/upload_image/` or via the bike create/update endpoint

---

### 3.3 — Review System Completion

**Backend:**
- **File:** `backend/apps/interactions/views.py`
- Ensure `ReviewViewSet` list action uses queryset `Review.objects.filter(bike_model=bike_id).select_related('user')` and returns `user.username`, `user.profile_image`, `rating`, `comment`, `created_at`
- Handle `IntegrityError` on `unique_together` → return HTTP 409

**Frontend:**
- **File:** `frontend/src/app/bike/[slug]/detail-client.tsx`
- Add auth check before showing review form: if `!user`, show "Login to write a review" button
- After submit, optimistically add the new review to the list
- Show average rating recalculated from all reviews

---

### 3.4 — Profile Center Completion

**Add new dedicated profile API endpoint:**
- **File:** `backend/apps/users/views.py`
- Create `ProfileDetailView` at `GET /api/v1/users/profile/full/` that returns:

```json
{
  "user": { "email", "first_name", "last_name", "profile_image", "role", "whatsapp_number", "location", "date_joined" },
  "stats": { "listings_count", "wishlist_count", "reviews_count", "member_since" },
  "listings": [ ...UsedBikeListing summary... ],
  "wishlist": [ ...BikeModel summary... ],
  "reviews": [ ...Review with bike name... ]
}
```

**Frontend:**
- **File:** `frontend/src/app/profile/page.tsx`
- Fetch from `/api/v1/users/profile/full/`
- Show 4 tabs: Overview, My Listings, Wishlist, Reviews
- Each tab shows the respective data from the single API call (or lazy-loaded per tab)

---

## PHASE 4 — UI Improvements

---

### 4.1 — Used Bike Detail Page Premium Redesign

**Current state:** Simple layout, basic info.

**Target design:** Premium marketplace feel.

**Tasks:**

**A. Large Image Gallery**
- **File:** `frontend/src/app/used-bike/[slug]/page.tsx` (or `detail-client.tsx`)
- Full-width hero image (600px height)
- Bottom strip of thumbnail images (horizontal scroll)
- Click thumbnail → swap main image
- Image counter badge (e.g., "1/5")
- Lightbox modal on main image click

**B. Seller Info Section**
- Seller avatar (profile_image or initials fallback)
- Seller name, member since date
- Verified badge if `is_verified = True`

**C. Contact Buttons**
```tsx
// WhatsApp button
<a href={`https://wa.me/88${seller.whatsapp_number}?text=Hi, I'm interested in your ${listing.title}`}>
  <Button>WhatsApp</Button>
</a>

// Call button  
<a href={`tel:${listing.contact_number}`}>
  <Button variant="outline">Call Seller</Button>
</a>
```

**D. Bike Specs Layout**
Two-column grid showing:
- Year | Mileage | Condition | Ownership Count
- Engine (from linked `bike_model`) | Body Condition | Engine Condition
- Has Accident History (Yes/No badge) | Original Papers

**E. Safety Indicators**
- 🟢 Green: `has_original_papers = True`, `has_accident_history = False`
- 🟡 Yellow: `ownership_count > 2`
- 🔴 Red: `has_accident_history = True`, `condition = 'need_work'`

**F. Report listing button**
- "Report this listing" link at the bottom → opens modal with reason dropdown → calls `POST /api/v1/marketplace/listings/<id>/report/`

---

## PHASE 5 — Performance Optimization

---

### 5.1 — Remove Unused Dependencies

**Frontend:**
- Remove `next-auth` from `package.json` if not used in any route (auth is handled via Zustand + manual JWT). **Verify first** by searching: `grep -r "next-auth" frontend/src/`
- Move `@tanstack/react-query-devtools` to `devDependencies`
- Remove or consolidate `hugeicons-react` if `lucide-react` covers all icons

**Backend:**
- Remove `Firebase*` env vars from `.env` (no SDK installed)
- Remove `SSLCOMMERZ_*` env vars from `.env` (no SDK installed)

---

### 5.2 — API Query Optimization

**Bikes list:**
- **File:** `backend/apps/bikes/views.py`
- Add `.select_related('brand', 'detailed_specs').prefetch_related('variants')` to list queryset
- Add `only()` to limit fields returned in list view vs detail view

**Admin stats:**
- **File:** `backend/apps/users/views.py` — `GlobalAdminStatsView`
- Replace multiple `.count()` queries with a single aggregated query using `annotate`

**Caching:**
- Add `@method_decorator(cache_page(60 * 15))` on `BrandListView` and `BikeModelListView` public endpoints
- Use Redis (already configured) as cache backend

---

### 5.3 — Frontend Bundle Optimization

**Task:** Analyze bundle size
```bash
cd frontend && ANALYZE=true npm run build
```

**Expected wins:**
- Tree-shake `framer-motion` (import only used exports)
- Use dynamic imports for heavy modal components (e.g., EMI calculator, compare panel)
- Use `next/dynamic` with `{ ssr: false }` for Zustand-dependent components

---

### 5.4 — Image Loading Optimization

**Frontend:**
- All `<Image>` components must have explicit `width` + `height` or use `fill` with a sized container
- Add `priority` prop only to above-the-fold images (hero, first carousel image)
- Add `sizes` prop: `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`
- Used bike images: use Cloudinary transformation URL `f_auto,q_auto,w_800` for listing thumbnails

---

## PHASE 6 — SEO Improvements

---

### 6.1 — Dynamic Meta Tags

**Bike detail pages:**
- **File:** `frontend/src/app/bike/[slug]/page.tsx`
- Export `generateMetadata` function that fetches bike from API and returns:
```tsx
export async function generateMetadata({ params }) {
  const bike = await fetchBike(params.slug);
  return {
    title: `${bike.name} Price in Bangladesh | MrBikeBD`,
    description: bike.meta_description || `${bike.brand.name} ${bike.name} - ${bike.engine_capacity}cc. Price in Bangladesh: ${formatPrice(bike.price)}`,
    openGraph: { images: [bike.primary_image] },
  };
}
```

**Used bike detail pages:**
- **File:** `frontend/src/app/used-bike/[slug]/page.tsx`
- Return: `title: "${listing.title} for sale - ${listing.price} BDT | MrBikeBD"`

---

### 6.2 — Sitemap Enhancement

**File:** `frontend/src/app/sitemap.ts`

Add dynamic URLs:
- All bike slugs: fetch from `/api/v1/bikes/?fields=slug,updated_at`
- All active used bike slugs: fetch from `/api/v1/marketplace/listings/?status=active&fields=slug,updated_at`
- All news article slugs
- All brand pages

---

### 6.3 — Structured Data (JSON-LD)

Add to bike detail page:
```tsx
<script type="application/ld+json">{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": bike.name,
  "brand": { "@type": "Brand", "name": bike.brand.name },
  "offers": { "@type": "Offer", "price": bike.price, "priceCurrency": "BDT" },
  "image": bike.primary_image,
})}</script>
```

---

---

## PHASE 0 — Admin Security & Credential Consolidation ⚠️ EXECUTE FIRST

> [!CAUTION]
> This section contains the platform's sole superadmin credentials. Do NOT commit this file to Git. Do NOT share credentials in plaintext in any other file or communication channel.

---

### 0.1 — Single Admin Account Policy

**Rule:** Only ONE account has superadmin access to the platform. All legacy admin accounts must be removed.

**Authorized Admin Account:**
| Field | Value |
|-------|-------|
| Email | `mrbikecloude@gmail.com` |
| Password | `mrbike@3456@gr_sf_mn_gme_nr_ta_unlef@6202` |
| Role | `superuser` (`is_superuser=True`, `is_staff=True`) |
| 2FA | **Required** (TOTP via Authenticator App) |

**Tasks:**

**A. Remove all legacy admin accounts from the database**

Run this management command (already exists in `backend/apps/users/management/`):
```bash
cd backend
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
# Remove ALL superusers except the authorized account
deleted = User.objects.filter(is_superuser=True).exclude(email='mrbikecloude@gmail.com').delete()
print(f'Deleted: {deleted}')
# Remove ALL staff accounts not authorized
deleted2 = User.objects.filter(is_staff=True).exclude(email='mrbikecloude@gmail.com').delete()
print(f'Deleted staff: {deleted2}')
"
```

**B. Create or verify the authorized admin account**
```bash
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
user, created = User.objects.get_or_create(email='mrbikecloude@gmail.com', defaults={
    'username': 'mrbikecloude',
    'is_superuser': True,
    'is_staff': True,
    'is_email_verified': True,
    'role': 'admin',
})
user.set_password('mrbike@3456@gr_sf_mn_gme_nr_ta_unlef@6202')
user.save()
print('Created' if created else 'Updated', user.email)
"
```

**C. Verify cleanup**
```bash
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
admins = User.objects.filter(is_superuser=True)
for u in admins:
    print(u.email, u.is_superuser, u.is_staff)
# Should print only: mrbikecloude@gmail.com True True
"
```

---

### 0.2 — Enforce 2FA (TOTP) for Admin Login ONLY

**Policy:** Regular users log in with email+password only. Only the admin account (`is_staff=True`) is redirected through TOTP verification.

The TOTP system is already implemented in `backend/apps/users/views.py` (`VerifyTOTPView`, `SetupTOTPView`). The `EmailLoginView` already contains the 2FA redirect logic at lines 219–226. The system is correct architecturally but must be enforced for the admin account specifically.

**Setup 2FA for the admin account (one-time):**

1. Login to the API as the admin:
   ```bash
   POST /api/v1/users/login/
   { "email": "mrbikecloude@gmail.com", "password": "mrbike@3456@gr_sf_mn_gme_nr_ta_unlef@6202" }
   # Response: { "requires_2fa": true, "totp_session": "..." }
   ```

2. Setup TOTP secret (first time only, must be logged in with admin access token):
   ```bash
   GET /api/v1/users/totp/setup/
   # Returns: { "secret": "BASE32SECRET", "qr_code": "base64png" }
   ```

3. Scan the QR code with **Google Authenticator** or **Authy**

4. Verify the first code to confirm setup:
   ```bash
   POST /api/v1/users/totp/setup/
   { "code": "123456" }
   ```

5. After setup, ALL subsequent admin logins require a 6-digit TOTP code.

**Frontend admin login flow:**
- **File:** `frontend/src/app/login/page.tsx`
- When API returns `{ requires_2fa: true, totp_session: "..." }`, show a second form step asking for the 6-digit TOTP code
- POST `{ totp_session: "...", code: "123456" }` to `POST /api/v1/users/totp/verify/`
- On success, store the JWT tokens normally

**Lockout protection (existing):**
- `LoginThrottle` limits to 5 attempts/min — already in place
- Redis caches the TOTP session for 5 minutes — already implemented
- After 5 minutes, admin must restart the login flow

**Testing checklist:**
- [ ] Login as admin → API returns `requires_2fa: true`
- [ ] Enter TOTP code from Authenticator app → receive JWT tokens
- [ ] Login as a regular user → NO 2FA prompt, direct JWT response
- [ ] Enter wrong TOTP code → `401 Invalid 2FA code`
- [ ] Wait 5+ minutes → `401 2FA session expired`

---

## JUNK FILES REMOVED — Cleanup Log

The following files and directories have been **permanently deleted** from `E:\mr\`:

### Root-Level Documentation Removed
| File | Reason |
|------|--------|
| `ADMIN_CONSOLIDATION_GUIDE.md` | Superseded by this plan |
| `ADMIN_CONSOLIDATION_IMPLEMENTATION.md` | Superseded by this plan |
| `ADMIN_QUICK_START.md` | Superseded by this plan |
| `COMPLETE_FIX_SUMMARY.md` | Historical summary, no longer needed |
| `DIAGNOSTIC_REPORT.md` | Historical, superseded by this plan |
| `DOCUMENTATION_INDEX.md` | Meta-doc, redundant |
| `FINAL_STATUS_REPORT.md` | Historical, superseded |
| `IMPLEMENTATION_PLAN.md` | Old plan, superseded by this document |
| `QUICK_START.md` | Superseded |
| `SEO_GEO_COMPREHENSIVE_GUIDE.md` | Merged into Phase 6 of this plan |
| `SPEC.md` | Superseded by this audit |
| `SUPABASE_DIAGNOSIS.md` | Historical, fixed |
| `VISUAL_SUMMARY.md` | Historical |
| `contabo_deployment_guide.md` | Not relevant to current dev phase |
| `testing_deployment_guide.md` | Not relevant to current dev phase |

### Root-Level Data Files Removed
| File | Reason |
|------|--------|
| `django.log` | Stale server log |
| `test_db.log` | Stale test output |
| `bike_data_format.json` | Old data format reference, unused |
| `db.json` | Old fixture dump (171KB), dangerous to keep |

### Directories Removed
| Directory | Reason |
|-----------|--------|
| `env/` | 16 old planning docs (PRD, design docs, .resolved files) — superseded by this plan |
| `get-shit-done-for-antigravity/` | External tool directory, not part of the project |

### Frontend Build Artifacts Removed
| File | Reason |
|------|--------|
| `frontend/build.log` | Stale build output |
| `frontend/build_debug.log` | Stale debug log |
| `frontend/build_debug_2.log` | Stale debug log |
| `frontend/build_errors.txt` | Stale error log |
| `frontend/build_errors_2.txt` | Stale error log |
| `frontend/build_errors_3.txt` | Stale error log |
| `frontend/build_errors_3_utf8.txt` | Stale error log |
| `frontend/build_errors_utf8.txt` | Stale error log |
| `frontend/build_output.txt` | Stale build output |
| `frontend/build_output_utf8.txt` | Stale build output |
| `frontend/ts_errors.txt` | Stale TypeScript error dump |

**Total removed: 26 files + 2 directories (~280KB of dead files)**

### Files/Directories Intentionally KEPT
| Path | Reason |
|------|--------|
| `backend/.env` | Active config — never delete |
| `backend/requirements.txt` | Active dependency list |
| `backend/scripts/` | May contain useful scripts |
| `frontend/.env.local` | Active frontend config |
| `frontend/tsconfig.tsbuildinfo` | Next.js build cache — auto-managed |
| `frontend/.next/` | Next.js build output — auto-managed |
| `backend/venv/` | Python virtual environment |

---

## PHASE EXECUTION ORDER

| Phase | Priority | Estimated Effort | Dependencies |
|-------|----------|-----------------|--------------|
| Phase 1 — Critical Fixes | 🔴 IMMEDIATE | 3–4 days | None |
| Phase 2 — DB Consolidation | 🟠 HIGH | 1 day | Phase 1 stable |
| Phase 3 — Feature Completion | 🟠 HIGH | 5–7 days | Phase 1, 2 |
| Phase 4 — UI Improvements | 🟡 MEDIUM | 3–4 days | Phase 3 |
| Phase 5 — Performance | 🟡 MEDIUM | 2–3 days | Phase 3 |
| Phase 6 — SEO | 🟢 LOW | 1–2 days | Phase 4, 5 |

**Total estimated effort: 15–21 development days**

---

## Verification Plan

### Automated Tests (Existing)

Backend has `pytest-django` + `factory_boy` configured:
```bash
cd backend
# Run all tests
python -m pytest --ds=core.settings.development -v

# Run specific app tests
python -m pytest apps/users/tests.py -v
python -m pytest apps/interactions/tests.py -v
```

### Manual Verification Checklist by Phase

**Phase 1 — Email:**
1. Register new account with real Gmail → verify email arrives
2. Test forgot-password flow
3. Approve a used bike listing → seller receives email

**Phase 1 — Cloudinary:**
1. Add bike from Django admin with 3 images → visit bike page → all images visible
2. Submit a used bike listing with 2 photos → after approval, check images on listing page

**Phase 1 — Reviews:**
1. Login → bikes page → any bike → submit review → appears immediately
2. Try second review → error shown

**Phase 2 — DB:**
1. Start Django: `python manage.py runserver` → no MongoDB connection errors in logs
2. Run migrations: `python manage.py migrate` → all apply cleanly

**Phase 3 — Marketplace:**
1. Login as regular user → Sell Bike → submit listing
2. Login as admin → Admin panel → Moderation → pending listing visible
3. Admin → Approve → seller gets email + notification
4. Admin → Reject (with reason) → seller gets rejection email

**Phase 4 — UI:**
1. Visit used bike listing → large image gallery loads
2. WhatsApp button opens `wa.me` link
3. Call button opens `tel:` link

**Phase 5 — Performance:**
1. Check network tab in Chrome DevTools → no 404 image requests
2. Lighthouse score ≥ 80 on `/bikes` page

**Phase 6 — SEO:**
1. View page source on `/bike/yamaha-r15` → confirm `<title>` and `<meta description>` are populated
2. Visit `/sitemap.xml` → confirm dynamic bike URLs listed
