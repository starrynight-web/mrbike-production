# ROLE: ELITE PRINCIPAL ARCHITECT & SECURITY AUDITOR (ITERATIVE VERIFICATION MODE)

## MISSION CRITICAL CONTEXT
You are transforming **MrBikeBD** from a **7/10 Beta** to a **10/10 Production-Grade SaaS Platform**. 

**Tech Stack Constraint:** Next.js 16.1.6 + React 19 (NON-NEGOTIABLE - DO NOT DOWNGRADE)

**Current State (from audit_report_final.md):**
- 🔴 Security: 5.5/10 - LIVE credentials exposed, broken throttling
- 🔴 GEO: 2/10 - Zero structured data for AI search
- 🟡 SEO: 8/10 - Good foundation but missing critical schemas
- 🟡 Performance: 6.5/10 - CSR on content pages, bundle bloat
- 🟡 Scalability: 6/10 - No marketplace caching, bottlenecks

## ⚠️ CRITICAL OPERATING PROTOCOL - ITERATIVE VERIFICATION LOOP

**BEFORE OUTPUTTING ANY CODE OR PLAN, YOU MUST:**

### CYCLE 1: DEEP AUDIT RE-ANALYSIS
1. Re-read audit_report_final.md sections 0-24 completely
2. Cross-reference with system.md architecture
3. Identify ALL 🔴 CRITICAL and 🟠 HIGH severity issues
4. Map dependencies between issues (e.g., fixing AuthThrottle affects rate limiting)
5. **VERIFY:** Have I identified every security vulnerability? (Check 3x)

### CYCLE 2: SOLUTION ARCHITECTURE REVIEW
1. Design solution for each critical issue
2. For EACH solution, ask:
   - Does this maintain Next.js 16+ compatibility? ✅
   - Does this introduce new security risks? ❌
   - Does this break existing functionality? ❌
   - Is this production-ready (no debug code)? ✅
   - Will this scale to 10k concurrent users? ✅
3. **VERIFY:** Have I stress-tested each solution against edge cases? (Check 3x)

### CYCLE 3: IMPLEMENTATION SEQUENCING
1. Order fixes by: Security → Stability → Performance → SEO/GEO → Polish
2. Identify which fixes MUST happen before others (dependencies)
3. Plan rollback strategy for each phase
4. **VERIFY:** Is this sequence optimal? Could any step break production? (Check 3x)

### CYCLE 4: CODE QUALITY GATE
Before generating ANY code:
1. Check for type safety (no `any` in TypeScript)
2. Verify error handling (try-catch, error boundaries)
3. Ensure logging (no `print()`, use proper logger)
4. Validate security (input sanitization, SQL injection prevention)
5. Confirm testing strategy (unit + integration tests)
6. **VERIFY:** Would this code pass a senior architect code review? (Check 3x)

### CYCLE 5: PRODUCTION READINESS CHECK
1. Environment variables secured? (no hardcoded secrets)
2. Monitoring enabled? (Sentry, logs, metrics)
3. Backward compatibility maintained?
4. Documentation updated?
5. **VERIFY:** Can this deploy to production TODAY without downtime? (Check 3x)

## 🔴 PHASE 0: EMERGENCY SECURITY CONTAINMENT (MUST VERIFY 5x)

**CRITICAL:** Before ANY other work, you MUST:

### 0.1 Credential Rotation Protocol
```
STEP 1: Identify ALL exposed credentials from audit:
- [ ] Supabase DATABASE_URL + SERVICE_ROLE_KEY
- [ ] Redis password + URL
- [ ] Cloudinary API_SECRET + API_KEY
- [ ] Google OAuth CLIENT_SECRET
- [ ] Brevo API_KEY
- [ ] Django SECRET_KEY

STEP 2: Generate rotation commands:
- Provide exact bash commands to rotate each credential
- Provide exact Render/Vercel dashboard steps to update env vars
- Provide .gitignore verification steps

STEP 3: Verification checklist:
- [ ] Run `git log -p -- backend/.env` to confirm exposure history
- [ ] Run `git filter-repo` commands to purge from history
- [ ] Verify .env is in .gitignore
- [ ] Test that old credentials fail
```

### 0.2 Critical Code Fixes (Verify Each 3x)
```
FIX 1: AuthThrottle.get_cache_key() signature
- Location: backend/apps/core/throttles.py:21
- Current: def get_cache_key(self):
- Required: def get_cache_key(self, request, view):
- Verify: Does this match DRF SimpleRateThrottle contract? (Check DRF source)
- Test: Write unit test for throttle behavior

FIX 2: Hardcoded admin email
- Location: backend/apps/users/views.py:112,246
- Current: if email.lower() == 'mrbikecloude@gmail.com':
- Required: if email.lower() == os.getenv('SUPER_ADMIN_EMAIL'):
- Verify: Is SUPER_ADMIN_EMAIL in .env.example?
- Test: Test with different admin emails

FIX 3: OTP timing attack
- Location: backend/apps/users/views.py:299
- Current: if otp_data['code'] == code:
- Required: if hmac.compare_digest(otp_data['code'], code):
- Verify: Import hmac at top of file
- Test: Verify constant-time comparison

FIX 4: Remove debug artifacts
- Scan backend/ for: print(), debug_*.py, check_*.py, api_response.json
- Replace print() with logger.debug()
- Delete all debug files
- Verify: Run `grep -r "print(" backend/apps/` to catch all
```

## 🚀 PHASE 1: SSR/SSG TRANSFORMATION (Next.js 16+ Compatible)

**CONSTRAINT:** MUST use Next.js 16 features (App Router, Server Components, ISR)

### 1.1 Convert CSR to SSR/ISR (Verify Each Page 3x)
```
PAGES TO CONVERT:
1. /bike/[slug] - Bike detail page
2. /used-bike/[slug] - Used bike listing
3. /news/[slug] - News article
4. /brands/[slug] - Brand page

FOR EACH PAGE, VERIFY:
□ Uses Server Component (no 'use client' at top)
□ Implements generateStaticParams() for SSG
□ Uses ISR with revalidate tag (Next.js 16 feature)
□ Fetches data server-side with native fetch()
□ Implements generateMetadata() for SEO
□ Handles 404 gracefully (notFound())
□ Error boundary implemented (error.tsx)

CODE TEMPLATE (Verify against Next.js 16 docs):
```typescript
// /bike/[slug]/page.tsx
export async function generateStaticParams() {
  const bikes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bikes/`, {
    cache: 'force-cache',
    next: { revalidate: 3600 }
  }).then(res => res.json());
  
  return bikes.results.map((bike: Bike) => ({ slug: bike.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const bike = await fetchBike(params.slug);
  return {
    title: `${bike.name} - Price, Specs & Reviews | MrBikeBD`,
    description: bike.meta_description || `Buy ${bike.name} in Bangladesh`,
    alternates: { canonical: `${process.env.NEXT_PUBLIC_APP_URL}/bike/${bike.slug}` }
  };
}

export default async function BikePage({ params }: { params: { slug: string } }) {
  const bike = await fetchBike(params.slug); // Server-side fetch
  
  if (!bike) notFound();
  
  return (
    <>
      <JsonLd bike={bike} />
      <BikeDetailClient bike={bike} />
    </>
  );
}
```

### 1.2 JSON-LD Schema Implementation (Verify Each Schema 5x)
```
REQUIRED SCHEMAS (Cross-check with Google Rich Results Test):

1. Product Schema (Bike Detail Pages)
   - @type: Product + Vehicle
   - Required fields: name, brand, offers, aggregateRating
   - Verify: All fields match schema.org/Vehicle spec
   - Test: Validate in Google Rich Results Test

2. Article Schema (News Pages)
   - @type: NewsArticle
   - Required: headline, author, datePublished, image
   - Verify: Matches schema.org/NewsArticle
   - Test: Validate in Rich Results Test

3. BreadcrumbList Schema (All Pages)
   - @type: BreadcrumbList
   - Verify: Correct nesting and positions
   - Test: Validate schema structure

4. FAQPage Schema (/faqs page)
   - @type: FAQPage
   - Required: mainEntity (Question + Answer pairs)
   - Verify: Each question has acceptedAnswer
   - Test: Rich Results Test

5. Organization Schema (Root Layout)
   - @type: Organization + WebSite
   - Required: name, url, logo, sameAs
   - Verify: Links to social profiles
   - Test: Structured Data Testing Tool

6. AggregateRating Schema (Bike Reviews)
   - @type: AggregateRating
   - Required: ratingValue, reviewCount
   - Verify: Matches actual review data
   - Test: Rich Results Test

IMPLEMENTATION CHECK (Verify 3x):
□ JSON-LD injected via <script type="application/ld+json">
□ Dynamic data properly escaped (no XSS)
□ Schema validates in Google Rich Results Test
□ All required fields present
□ Optional fields included for rich snippets
```

## 🔐 PHASE 2: BACKEND HARDENING & RBAC COMPLETION

### 2.1 Atomic Operations (Verify Each Transaction 3x)
```
FIX 1: Wishlist Toggle Race Condition
Location: backend/apps/interactions/views.py:43-48
Current: Read-then-write (non-atomic)
Required: Use select_for_update() or update_or_create()

CODE:
from django.db import transaction

@transaction.atomic
def toggle_wishlist(request, bike_id):
    with transaction.atomic():
        wishlist, created = Wishlist.objects.select_for_update().get_or_create(
            user=request.user,
            bike_id=bike_id
        )
        if not created:
            wishlist.delete()
            return Response({'status': 'removed'})
    return Response({'status': 'added'})

VERIFY:
□ select_for_update() prevents concurrent modifications
□ transaction.atomic() ensures rollback on failure
□ Test with 100 concurrent requests

FIX 2: Review Upsert Race Condition
Location: backend/apps/interactions/views.py:28-34
Current: filter().first() then save()
Required: Review.objects.update_or_create()

CODE:
review, created = Review.objects.update_or_create(
    user=request.user,
    bike=bike,
    defaults={'rating': rating, 'comment': comment}
)

VERIFY:
□ update_or_create is atomic
□ Unique constraint exists on (user, bike)
□ Test duplicate review submission

FIX 3: Listing Creation with Images
Location: backend/apps/marketplace/serializers.py
Current: Create listing, then queue tasks (orphan risk)
Required: transaction.on_commit() for task queuing

CODE:
from django.db import transaction

def create(self, validated_data):
    listing = UsedBikeListing.objects.create(**validated_data)
    
    # Only queue tasks after DB commit succeeds
    transaction.on_commit(lambda: 
        async_task('apps.marketplace.tasks.process_listing_image', listing.id)
    )
    
    return listing

VERIFY:
□ Tasks only queue after successful commit
□ on_commit handles rollback correctly
□ Test with DB failure scenario
```

### 2.2 RBAC Completion (Verify Each Permission 3x)
```
CURRENT STATE: seller/dealer roles exist but not enforced

REQUIRED PERMISSION CLASSES:

class IsSeller(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.role in ['seller', 'dealer', 'moderator', 'admin'])

class IsDealer(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.role in ['dealer', 'moderator', 'admin'])

class IsVerifiedSeller(IsSeller):
    def has_permission(self, request, view):
        return (super().has_permission(request, view) and 
                request.user.is_email_verified)

APPLY TO VIEWS:
□ marketplace/ POST → IsVerifiedSeller
□ marketplace/ PATCH (own listings) → IsOwnerOrReadOnly
□ marketplace/ approve → IsSuperAdminOnly
□ bikes/ POST → IsSuperAdminOnly
□ news/ POST → IsSuperAdminOnly (not IsAdminUser)

VERIFY:
□ All permission classes tested
□ 403 returned for insufficient permissions
□ Role hierarchy works correctly
```

## ⚡ PHASE 3: PERFORMANCE OPTIMIZATION

### 3.1 Caching Strategy (Verify Each Cache Layer 3x)
```
LAYER 1: Marketplace Listing Cache (CRITICAL - Missing per audit)
Location: backend/apps/marketplace/views.py
Implementation:

from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator

@method_decorator(cache_page(60 * 5), name='list')  # 5-minute cache
class UsedBikeListingViewSet(viewsets.ReadOnlyModelViewSet):
    def get_queryset(self):
        return UsedBikeListing.objects.select_related(
            'user', 'bike_model', 'bike_model__brand'
        ).prefetch_related('images').filter(status='approved')

VERIFY:
□ Cache invalidates on listing update
□ Cache key includes filter params
□ Redis cache backend configured
□ Test cache hit/miss ratio

LAYER 2: Bike Detail API Cache
Implementation:
@cache_page(60 * 60)  # 1-hour cache
@method_decorator(vary_on_cookie, name='dispatch')
class BikeModelViewSet(viewsets.ReadOnlyModelViewSet):
    ...

VERIFY:
□ Vary headers set correctly
□ Cache respects user-specific data
□ ISR revalidation configured on frontend

LAYER 3: Frontend TanStack Query Optimization
Implementation:
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

VERIFY:
□ Cache TTLs align with backend
□ No unnecessary refetches
□ Optimistic updates for mutations
```

### 3.2 Bundle Optimization (Verify Each Optimization 3x)
```
ISSUE 1: Duplicate Icon Libraries
Audit: lucide-react + hugeicons-react both imported
Solution: Choose ONE (recommend lucide-react)

Steps:
1. grep -r "hugeicons-react" frontend/src/ to find all imports
2. Replace with lucide-react equivalents
3. Remove hugeicons-react from package.json
4. Run bundle analyzer to verify reduction

VERIFY:
□ All icons replaced
□ Bundle size reduced by ~30KB
□ Visual appearance unchanged

ISSUE 2: Zustand DevTools in Production
Location: frontend/src/store/index.ts
Current: devtools enabled unconditionally
Required:

import { devtools, persist } from 'zustand/middleware'

const useStore = create(
  devtools(
    persist(...),
    { enabled: process.env.NODE_ENV === 'development' }
  )
)

VERIFY:
□ DevTools only in development
□ Production build has no devtools code
□ Test in production build

ISSUE 3: Framer Motion Lazy Loading
Implementation:
import { lazyMotion, domAnimation } from 'framer-motion'

const LazyMotion = lazyMotion(() => import('framer-motion').then(m => ({
  default: m.LazyMotion,
  domAnimation: m.domAnimation
})))

VERIFY:
□ Motion only loads when needed
□ Bundle size reduced
□ Animations still work
```

## 🔄 PHASE 4: CI/CD & OBSERVABILITY

### 4.1 GitHub Actions Pipeline (Verify Each Stage 3x)
```yaml
name: Production Deployment
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Backend Security Scan
        run: |
          pip install pip-audit bandit safety
          pip-audit -r backend/requirements.txt
          bandit -r backend/apps/ -ll
          safety check -r backend/requirements.txt
      
      - name: Frontend Security Scan
        run: |
          cd frontend
          npm audit --audit-level=moderate
          npm run lint
      
      - name: Secret Detection
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Backend Tests
        run: |
          cd backend
          pip install -r requirements.txt
          pytest --cov=apps --cov-report=xml --cov-fail-under=80
      
      - name: Frontend Tests
        run: |
          cd frontend
          npm ci
          npm test -- --coverage --watchAll=false
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://mrbikebd.vercel.app
            https://mrbikebd.vercel.app/bike/yamaha-r15-v4
            https://mrbikebd.vercel.app/used-bikes
          uploadArtifacts: true
          temporaryPublicStorage: true
          settings: |
            {
              "extends": "lighthouse:default",
              "performance": { "minScore": 90 },
              "accessibility": { "minScore": 95 },
              "seo": { "minScore": 100 }
            }

  deploy-staging:
    needs: [security-scan, test, lighthouse]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Staging
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_STAGING }}
      
      - name: Smoke Tests
        run: |
          # Wait for deployment
          sleep 30
          # Test critical endpoints
          curl -f https://mrbikebd-staging.vercel.app/health
          curl -f https://mrbikebd-backend-staging.onrender.com/api/v1/bikes/

  deploy-production:
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to Production
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_PROD }}
          curl -X POST ${{ secrets.VERCEL_DEPLOY_HOOK_PROD }}

VERIFY:
□ Pipeline blocks on security failures
□ Test coverage >= 80%
□ Lighthouse scores meet thresholds
□ Staging deployment succeeds before production
□ Rollback strategy documented
```

### 4.2 Sentry & Monitoring (Verify Each Integration 3x)
```
SENTRY CONFIGURATION:

Backend (backend/core/settings/production.py):
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=os.getenv('SENTRY_DSN'),
    integrations=[DjangoIntegration()],
    traces_sample_rate=0.1,  # Sample 10% of transactions
    send_default_pii=True,
    environment='production',
    release=os.getenv('GIT_COMMIT_SHA', 'unknown'),
    before_send=lambda event, hint: event if event['level'] != 'info' else None  # Don't send info logs
)

Frontend (frontend/src/lib/sentry.ts):
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    new Sentry.Replay(),
    new Sentry.BrowserTracing(),
  ],
});

VERIFY:
□ DSN set in environment variables (not hardcoded)
□ PII filtering configured
□ Performance monitoring active
□ Error grouping works correctly
□ Alerts configured for critical errors
□ Test error reporting in staging

CUSTOM METRICS:
□ API response time tracking
□ Database query performance
□ Cache hit/miss ratios
□ User action tracking (listing created, review submitted)
□ Business metrics (daily active users, listings per day)
```

## 📋 FINAL VERIFICATION CHECKLIST (MUST VERIFY 10x)

### Security (10/10 Required)
- [ ] Zero credentials in code/repos
- [ ] All secrets rotated and in platform env vars
- [ ] AuthThrottle fixed and tested
- [ ] Rate limiting on ALL auth/email endpoints
- [ ] Constant-time comparisons for sensitive data
- [ ] Input sanitization on all user inputs
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] CSRF protection active
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Dependency vulnerabilities scanned

### GEO (10/10 Required)
- [ ] JSON-LD on 100% of content pages
- [ ] Product schema validated
- [ ] Article schema validated
- [ ] FAQ schema validated
- [ ] Breadcrumb schema validated
- [ ] AggregateRating schema validated
- [ ] Organization schema validated
- [ ] All schemas pass Rich Results Test
- [ ] Entity links to Wikidata/Wikipedia
- [ ] AI-friendly content structure

### SEO (10/10 Required)
- [ ] All content pages use SSR/SSG
- [ ] Unique meta titles per page
- [ ] Unique meta descriptions per page
- [ ] Canonical tags on all pages
- [ ] XML sitemap submitted
- [ ] Robots.txt configured
- [ ] Google Search Console verified
- [ ] Core Web Vitals: LCP < 2.5s
- [ ] Core Web Vitals: CLS < 0.1
- [ ] Core Web Vitals: FID < 100ms
- [ ] Mobile-friendly verified
- [ ] 404 page with navigation

### Performance (10/10 Required)
- [ ] Backend: All views use select_related/prefetch_related
- [ ] Redis caching for frequent queries
- [ ] Marketplace feed cached (5 min TTL)
- [ ] Database query logging enabled
- [ ] Frontend: Code splitting implemented
- [ ] Frontend: Lazy loading for heavy components
- [ ] Images: WebP format + responsive sizes
- [ ] Images: Lazy loading
- [ ] Bundle size < 200KB initial
- [ ] API responses compressed (Gzip/Brotli)
- [ ] CDN caching configured

### Maintainability (10/10 Required)
- [ ] Zero debug files in repo
- [ ] Consistent code style (black, isort, eslint)
- [ ] Type hints throughout (no `any`)
- [ ] API documented (Swagger/ReDoc)
- [ ] CHANGELOG.md maintained
- [ ] Onboarding guide < 1 hour setup
- [ ] Automated dependency updates
- [ ] Architecture Decision Records (ADRs)
- [ ] Runbook for common incidents

### Scalability (10/10 Required)
- [ ] RBAC fully implemented
- [ ] Soft deletes with recovery
- [ ] Database read replicas configured
- [ ] Multi-layer caching (Redis + CDN)
- [ ] Queue horizontal scaling
- [ ] Frontend ISR configured
- [ ] Auto-scaling configured
- [ ] Load tested to 10k concurrent users
- [ ] Circuit breaker for external APIs
- [ ] Disaster recovery tested

### Observability (10/10 Required)
- [ ] CI pipeline with security gates
- [ ] Sentry active in production
- [ ] Structured JSON logging
- [ ] Metrics endpoint (Prometheus)
- [ ] Uptime monitoring
- [ ] Alerting configured (Slack/Email)
- [ ] Dashboard for business metrics
- [ ] Runbooks for alerts
- [ ] Post-mortem process
- [ ] Cost monitoring

## 🎯 EXECUTION PROTOCOL

**YOU MUST:**

1. **READ** audit_report_final.md completely (all 24 sections)
2. **ANALYZE** each critical issue and its dependencies
3. **DESIGN** solution architecture for each phase
4. **VERIFY** each solution 3x before coding
5. **IMPLEMENT** with type safety and error handling
6. **TEST** with unit + integration tests
7. **DOCUMENT** changes in code comments
8. **RE-VERIFY** entire system after each phase
9. **STRESS TEST** against edge cases
10. **FINAL AUDIT** against 10/10 checklist

**DO NOT:**
- Downgrade Next.js version
- Skip verification cycles
- Hardcode any values
- Leave debug code
- Ignore error handling
- Skip tests
- Deploy without staging verification

**OUTPUT FORMAT:**
For each phase, provide:
1. Analysis summary
2. Solution architecture
3. Code implementations (complete, production-ready)
4. Test cases
5. Verification checklist
6. Rollback plan
7. Next phase dependencies

**BEGIN NOW. START WITH PHASE 0. VERIFY EVERYTHING 3x MINIMUM.**
```

---

## 📝 HOW TO USE THIS PROMPT

1. **Copy the entire prompt above**
2. **Paste into Google Antigravity**
3. **Attach both audit files** (`audit_report_final.md` and `audit_report.md`)
4. **Add your system.md** if you have one
5. **Execute**

This prompt forces the AI to:
- ✅ Re-analyze the audit **multiple times**
- ✅ Verify each solution **3-5 times** before coding
- ✅ Maintain Next.js 16+ (no downgrade)
- ✅ Follow a strict **iterative verification loop**
- ✅ Check every phase **deeply** before moving on
- ✅ Achieve true **10/10 production readiness**

