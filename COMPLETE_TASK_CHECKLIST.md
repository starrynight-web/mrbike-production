# 📋 COMPLETE TASK CHECKLIST - MrBikeBD

**Start Date:** February 8, 2026  
**Target Completion:** February 20-22, 2026  
**Total Timeline:** 10-14 days (57-75 hours)

---

## 🔴 PHASE 1: CRITICAL FIXES (Days 1-3) - 15-20 Hours

### Day 1: Morning (Git & Build Fixes)

#### Task 1.1: Fix TypeScript Build Error ✅ FIRST
- [ ] Open: `frontend/src/app/bikes/catalogue-client.tsx`
- [ ] Go to line 113
- [ ] Change: `bikes.map((bike, index) =>` 
- [ ] To: `bikes.map((bike: BikeModel, index: number) =>`
- [ ] Run: `cd frontend && npm run build`
- [ ] Verify: Build completes successfully
- **Time:** 15 minutes
- **Blockers Unblocked:** Frontend can be deployed

#### Task 1.2: Enable JWT Authentication
- [ ] Open: `backend/core/settings.py`
- [ ] Go to line 126
- [ ] UNCOMMENT: `'rest_framework_simplejwt.authentication.JWTAuthentication',`
- [ ] Test API: `curl -X GET http://localhost:8000/api/bikes/`
- [ ] Should work (GET doesn't require auth)
- [ ] Test DELETE without token: `curl -X DELETE http://localhost:8000/api/bikes/1/`
- [ ] Should fail with 401 Unauthorized
- **Time:** 30 minutes
- **Blockers Unblocked:** API security enabled

#### Task 1.3: Generate New SECRET_KEY
- [ ] Run in terminal:
  ```bash
  cd backend
  python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  ```
- [ ] Copy output
- [ ] Open: `backend/.env`
- [ ] Find: `SECRET_KEY=...` (old default)
- [ ] Replace with: generated key
- [ ] Save file
- [ ] Test: `python manage.py shell` should work
- **Time:** 15 minutes
- **Blockers Unblocked:** Token forgery protection

---

### Day 1: Afternoon (Database Setup)

#### Task 1.4: Setup PostgreSQL Database
- [ ] **Option A: Windows**
  ```bash
  # Download & install PostgreSQL from https://www.postgresql.org/download/windows/
  # Or use: choco install postgresql
  # Or in WSL: sudo apt install postgresql
  ```
- [ ] **Option B: Docker** (Recommended)
  ```bash
  docker run --name mrbikebd-postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=mrbikebd \
    -p 5432:5432 \
    -d postgres:15
  ```
- [ ] Verify connection: 
  ```bash
  psql -U postgres -h localhost -c "CREATE DATABASE mrbikebd;"
  ```
- **Time:** 30-60 minutes
- **Blockers Unblocked:** Real database ready

#### Task 1.5: Update DATABASE_URL in .env
- [ ] Open: `backend/.env`
- [ ] Add or update:
  ```dotenv
  DATABASE_URL=postgres://postgres:postgres@localhost:5432/mrbikebd
  # Or for Windows with local PostgreSQL:
  DATABASE_URL=postgres://postgres:password@127.0.0.1:5432/mrbikebd
  ```
- [ ] Save
- [ ] Test connection in Django shell:
  ```bash
  python manage.py shell
  >>> from django.db import connection
  >>> cursor = connection.cursor()
  >>> cursor.execute("SELECT 1")
  # Should work
  ```
- **Time:** 15 minutes

#### Task 1.6: Run Django Migrations
- [ ] Navigate: `cd backend`
- [ ] Run: `python manage.py migrate`
- [ ] Expected output: 
  ```
  Operations to perform:
    Apply all migrations: admin, auth, bikes, ...
  Running migrations:
    Applying auth.0001_initial... OK
    ...
  ```
- [ ] Verify with: `python -c "from django.db import connection; cursor = connection.cursor(); cursor.execute('SELECT COUNT(*) FROM django_migrations'); print(cursor.fetchone()[0])"`
- **Time:** 5 minutes

#### Task 1.7: Import Bike Data
- [ ] Run migration script:
  ```bash
  python backend/scripts/migrate_bikes.py
  ```
- [ ] Expected output:
  ```
  ✓ Loading bikes.json (305 bikes)
  ✓ Creating brands...
  ✓ Importing bikes...
  ✓ Successfully imported 305 bikes
  ```
- [ ] Verify: 
  ```bash
  python manage.py shell
  >>> from apps.bikes.models import BikeModel
  >>> print(BikeModel.objects.count())  # Should be 300+
  ```
- [ ] Test API: `curl -X GET http://localhost:8000/api/bikes/ | head -100`
- [ ] Should return JSON with bike data
- **Time:** 30 minutes
- **Blockers Unblocked:** Database populated, frontend can show real data

---

### Day 2: Morning (API Endpoints)

#### Task 1.8: Register Missing Routes
- [ ] Open: `backend/core/urls.py`
- [ ] Check all these routes are registered:
  - [ ] `/api/bikes/` - ✅ Should be there
  - [ ] `/api/used-bikes/` - ✅ Should be there
  - [ ] `/api/news/` - ✅ Should be there
  - [ ] `/api/users/` - ✅ Should be there
  - [ ] `/api/interactions/` - ✅ Should be there
  - [ ] `/api/recommendations/` - ✅ Should be there
  - [ ] `/api/admin/` - ✅ Should be there
- [ ] Test each one:
  ```bash
  curl -X GET http://localhost:8000/api/bikes/
  curl -X GET http://localhost:8000/api/news/
  curl -X GET http://localhost:8000/api/recommendations/
  # All should return 200 OK
  ```
- **Time:** 30 minutes

#### Task 1.9: Implement Missing Endpoints
- [ ] **Endpoint 1: GET `/api/admin/stats/`**
  - [ ] File: `backend/apps/core/views.py`
  - [ ] Code:
    ```python
    from rest_framework.views import APIView
    from rest_framework.response import Response
    from apps.bikes.models import BikeModel
    from apps.users.models import User
    from apps.marketplace.models import UsedBikeListing
    
    class AdminStatsView(APIView):
        permission_classes = [IsAdminUser]
        
        def get(self, request):
            return Response({
                'total_bikes': BikeModel.objects.count(),
                'total_users': User.objects.count(),
                'total_listings': UsedBikeListing.objects.count(),
                'pending_listings': UsedBikeListing.objects.filter(status='pending').count(),
                'featured_bikes': BikeModel.objects.filter(is_featured=True).count(),
            })
    ```
  - [ ] Register in `apps/core/urls.py`:
    ```python
    path('stats/', AdminStatsView.as_view(), name='admin-stats')
    ```
  - [ ] Test: `curl -X GET http://localhost:8000/api/admin/stats/`

- [ ] **Endpoint 2: GET `/api/recommendations/similar/{id}/`**
  - [ ] File: `backend/apps/recommendations/views.py`
  - [ ] Should already exist, just verify it works
  - [ ] Test: `curl -X GET http://localhost:8000/api/recommendations/similar/1/`

- [ ] **Endpoint 3: POST `/api/bikes/{id}/upload-image/`**
  - [ ] File: `backend/apps/bikes/views.py`
  - [ ] Code: Add image upload handler to BikeModelViewSet
  - [ ] Validate file types (jpg, png, webp only)
  - [ ] Validate file size (max 5MB)
  - [ ] Test with file upload

- **Time:** 3 hours

---

### Day 2: Afternoon (Authentication)

#### Task 1.10: Setup NextAuth Configuration
- [ ] File: `frontend/src/app/api/auth/[...nextauth]/route.ts`
- [ ] Complete implementation:
  ```typescript
  import NextAuth from "next-auth";
  import GoogleProvider from "next-auth/providers/google";
  import CredentialsProvider from "next-auth/providers/credentials";
  import axios from "axios";

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  export const authOptions = {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      }),
      CredentialsProvider({
        id: "email",
        async authorize(credentials) {
          const res = await axios.post(`${API_BASE}/users/login/`, {
            email: credentials?.email,
            password: credentials?.password,
          });
          
          const user = res.data;
          if (user.access) {
            user.accessToken = user.access;
            user.refreshToken = user.refresh;
            return user;
          }
          return null;
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user, account }) {
        if (user) {
          token.accessToken = user.accessToken;
          token.refreshToken = user.refreshToken;
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.accessToken = token.accessToken;
          session.user.id = token.id;
        }
        return session;
      },
    },
    pages: {
      signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
  };

  export default NextAuth(authOptions);
  ```
- [ ] Add environment variables in `frontend/.env.local`:
  ```
  NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
  GOOGLE_CLIENT_ID=<from Google Console>
  GOOGLE_CLIENT_SECRET=<from Google Console>
  ```
- [ ] Test: `npm run dev`, visit `/api/auth/signin`
- **Time:** 2 hours
- **Blockers Unblocked:** Frontend login flow works

#### Task 1.11: Get Google OAuth Credentials
- [ ] Visit: https://console.cloud.google.com/
- [ ] Create new project: "MrBikeBD"
- [ ] Enable: Google+ API
- [ ] Create OAuth 2.0 credentials:
  - [ ] Type: OAuth 2.0 Client ID
  - [ ] Application type: Web application
  - [ ] Authorized redirect URIs:
    - `http://localhost:3000/api/auth/callback/google`
    - `http://localhost:8000/api/users/auth/google/callback/`
- [ ] Copy: Client ID & Client Secret
- [ ] Add to `frontend/.env.local`:
  ```
  GOOGLE_CLIENT_ID=...
  GOOGLE_CLIENT_SECRET=...
  ```
- [ ] Add to `backend/.env`:
  ```
  GOOGLE_CLIENT_ID=...
  GOOGLE_CLIENT_SECRET=...
  ```
- [ ] Test: google login button on `/login` page
- **Time:** 1 hour
- **Blockers Unblocked:** Google OAuth enabled

---

### Day 2-3: Security Hardening

#### Task 1.12: Restrict ALLOWED_HOSTS
- [ ] File: `backend/.env`
- [ ] Update:
  ```dotenv
  ALLOWED_HOSTS=localhost,127.0.0.1,localhost:8000,127.0.0.1:8000
  ```
- [ ] Verify: `python manage.py check`
- **Time:** 10 minutes

#### Task 1.13: Restrict CORS Origins
- [ ] File: `backend/config_settings.py`
- [ ] Update:
  ```python
  CORS_ALLOWED_ORIGINS = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
  ]
  ```
- [ ] Remove: `CORS_ALLOW_ALL_ORIGINS = DEBUG`
- **Time:** 10 minutes

#### Task 1.14: Rotate API Credentials
- [ ] Cloudinary:
  - [ ] Visit: https://cloudinary.com/console/settings/security
  - [ ] Regenerate API secret
  - [ ] Update `backend/.env`

- [ ] MongoDB:
  - [ ] Visit: MongoDB Atlas dashboard
  - [ ] Create new database user with strong password
  - [ ] Update `MONGODB_URI` in `.env`

- [ ] Redis:
  - [ ] If using Redis Cloud: regenerate password
  - [ ] Update `REDIS_PASSWORD` in `.env`

- **Time:** 30 minutes

#### Task 1.15: Test Complete Authentication Flow
- [ ] [ ] Backend running: `python manage.py runserver`
- [ ] [ ] Frontend running: `npm run dev`
- [ ] [ ] Test sequence:
  ```bash
  # 1. Verify JWT works
  python manage.py shell
  >>> from rest_framework_simplejwt.tokens import RefreshToken
  >>> from apps.users.models import User
  >>> user = User.objects.first()
  >>> refresh = RefreshToken.for_user(user)
  >>> print(str(refresh.access_token))
  
  # 2. Use token to auth
  curl -X GET http://localhost:8000/api/bikes/ \
    -H "Authorization: Bearer <TOKEN>"
  # Should work
  
  # 3. Test without token
  curl -X DELETE http://localhost:8000/api/bikes/1/
  # Should return 401
  ```
- [ ] Test Frontend:
  - [ ] Visit `http://localhost:3000/login`
  - [ ] Click "Sign in with Google"
  - [ ] Complete OAuth flow
  - [ ] Should redirect to dashboard

- **Time:** 1 hour

---

## PHASE 1 SUMMARY

| Task | Time | Status |
|------|------|--------|
| Fix TypeScript | 15 min | |
| Enable JWT | 30 min | |
| Generate SECRET_KEY | 15 min | |
| Setup PostgreSQL | 30-60 min | |
| Migrations | 5 min | |
| Import data | 30 min | |
| Register routes | 30 min | |
| Implement endpoints | 3 hours | |
| NextAuth config | 2 hours | |
| Google OAuth | 1 hour | |
| Security hardening | 1 hour | |
| Testing | 1 hour | |
| **TOTAL PHASE 1** | **15-20 hours** | |

**Blockers Cleared After Phase 1:**
- ✅ Frontend builds
- ✅ Database has data
- ✅ API requires authentication
- ✅ Login works (Google)
- ✅ Admin panel can access data

---

## 🟠 PHASE 2: HIGH-PRIORITY (Days 3-5) - 15-20 Hours

### Task 2.1: Phone OTP System (4 hours)

- [ ] **Step 1: Setup Firebase**
  ```bash
  npm install --save firebase-admin
  ```

- [ ] **Step 2: Create OTP Views** in `backend/apps/users/views.py`
  ```python
  from firebase_admin import auth
  
  class SendOTPView(APIView):
      def post(self, request):
          phone = request.data.get('phone')
          # Validate phone format
          # Send with Firebase
          # Return: "OTP sent"
  
  class VerifyOTPView(APIView):
      def post(self, request):
          phone = request.data.get('phone')
          otp = request.data.get('otp')
          # Verify with Firebase
          # Create/return user
  ```

- [ ] **Step 3: Frontend OTP Form**
  - [ ] Create: `frontend/src/app/auth/phone-verify/page.tsx`
  - [ ] Show phone input
  - [ ] Show OTP input (after phone submitted)
  - [ ] Call endpoints

- [ ] **Time:** 4 hours

### Task 2.2: Image Upload & Processing (3 hours)

- [ ] **Step 1: Integrate Cloudinary**
  ```python
  # backend/apps/bikes/image_processor.py
  import cloudinary
  
  cloudinary.config(
      cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
      api_key=os.getenv('CLOUDINARY_API_KEY'),
      api_secret=os.getenv('CLOUDINARY_API_SECRET'),
  )
  
  def upload_to_cloudinary(file):
      result = cloudinary.uploader.upload(
          file,
          folder='mrbikebd/bikes',
          quality='auto',
          fetch_format='auto',
      )
      return result['secure_url']
  ```

- [ ] **Step 2: Complete Upload Endpoint**
  - [ ] Validate file type
  - [ ] Validate file size
  - [ ] Upload to Cloudinary
  - [ ] Return URL

- [ ] **Step 3: Frontend Upload Component**
  - [ ] Create upload UI with preview
  - [ ] Call `/api/bikes/{id}/upload-image/`
  - [ ] Show progress

- [ ] **Time:** 3 hours

### Task 2.3: Email Service Integration (3 hours)

- [ ] **Step 1: Choose Provider**
  - [ ] Option A: SendGrid (recommended)
  - [ ] Option B: AWS SES
  - [ ] Option C: Brevo

- [ ] **Step 2: Create Email Templates**
  ```python
  # backend/apps/users/emails.py
  from django.core.mail import send_mail
  
  def send_welcome_email(user):
      send_mail(
          subject='Welcome to MrBikeBD',
          message='...',
          from_email='noreply@mrbikebd.com',
          recipient_list=[user.email],
      )
  ```

- [ ] **Step 3: Add to Signup**
  - [ ] Call `send_welcome_email()` on signup
  - [ ] Add `on_signup()` signal

- [ ] **Step 4: Add to Approvals**
  - [ ] Send email when listing approved
  - [ ] Send email when listing rejected

- [ ] **Time:** 3 hours

### Task 2.4: Complete Missing Routes (2 hours)

- [ ] **News Endpoints**
  - [ ] GET `/api/news/` → List articles
  - [ ] GET `/api/news/{id}/` → Get article
  - [ ] POST `/api/news/` (admin only) → Create article

- [ ] **Recommendations**
  - [ ] GET `/api/recommendations/similar/{id}/` → Similar bikes

- [ ] **Interactions**
  - [ ] GET `/api/interactions/wishlist/` → User wishlist
  - [ ] POST `/api/interactions/wishlist/{id}/` → Toggle wishlist

- [ ] **Time:** 2 hours

### Task 2.5: TypeScript Type Safety (2 hours)

- [ ] Add types to frontend components:
  ```typescript
  // Before
  const handleClick = (bike) => { ... }
  
  // After  
  const handleClick = (bike: BikeModel) => { ... }
  ```

- [ ] Fix implicit 'any' errors
- [ ] Run: `npm run build`
- [ ] All TypeScript errors should clear

- [ ] **Time:** 2 hours

### Task 2.6: Security Hardening #2 (2 hours)

- [ ] Add CSRF token validation
- [ ] Add file upload validation
- [ ] Add rate limiting to admin endpoints
- [ ] Add account lockout (5 failed attempts)

- [ ] **Time:** 3 hours

### PHASE 2 SUMMARY

| Task | Time |
|------|------|
| Phone OTP | 4h |
| Image Upload | 3h |
| Email Service | 3h |
| Missing Routes | 2h |
| Type Safety | 2h |
| Security | 3h |
| **TOTAL** | **17 hours** |

---

## 🟡 PHASE 3: FRONTEND INTEGRATION (Days 5-8) - 15-20 Hours

### Task 3.1: Replace Mock Data (6 hours)

Replace all hardcoded mock data with real API calls:

- [ ] Update `/app/bikes/` page
- [ ] Update `/app/used-bikes/` page
- [ ] Update `/app/brands/` page
- [ ] Update `/app/news/` page
- [ ] Add loading skeletons
- [ ] Add error boundaries

### Task 3.2: Auth Pages (6 hours)

Build complete auth flow:

- [ ] `/auth/register` - Email/password signup
- [ ] `/auth/login` - Login page
- [ ] `/auth/phone-verify` - OTP verification
- [ ] `/auth/forgot-password` - Password reset
- [ ] Test complete flow end-to-end

### Task 3.3: User Pages (4 hours)

- [ ] `/profile` - User profile
- [ ] `/dashboard` - User dashboard
- [ ] `/settings` - User settings

### Task 3.4: Seller Features (4 hours)

- [ ] `/sell-bike` - Sell form
- [ ] `/my-listings` - User's listings
- [ ] `/edit-listing/{id}` - Edit listing

### PHASE 3 SUMMARY: 20 hours

---

## 🎯 PHASE 4: TESTING & LAUNCH (Days 8-10) - 12-15 Hours

### Task 4.1: Backend Testing (4 hours)
- [ ] Test all API endpoints
- [ ] Test permission checks
- [ ] Test error handling
- [ ] Test rate limiting

### Task 4.2: Frontend Testing (3 hours)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Forms & validation
- [ ] Loading states
- [ ] Error states

### Task 4.3: Security Testing (3 hours)
- [ ] Run OWASP scan
- [ ] Test SQL injection protection (Django ORM)
- [ ] Test XSS protection (Django templates)
- [ ] Test CSRF validation

### Task 4.4: Performance (2 hours)
- [ ] Measure page load times
- [ ] Setup Redis caching
- [ ] Optimize images
- [ ] Test on slow network

### Task 4.5: Deployment (3 hours)
- [ ] Setup production database
- [ ] Configure environment variables
- [ ] Setup error monitoring (Sentry)
- [ ] Configure logging

### PHASE 4 SUMMARY: 15 hours

---

## 📊 COMPLETE TIMELINE

```
Total Hours: 57-75 hours
Total Days: 10-14 days
Weeks: 2-3 weeks

PHASE 1 (Critical):     15-20 hours (3 days)
PHASE 2 (High-Prio):    15-20 hours (2 days)
PHASE 3 (Frontend):     15-20 hours (3 days)
PHASE 4 (Testing):      12-15 hours (2 days)
```

**Best Case:** 57 hours = 10 days (assumes 6h/day)  
**Normal Case:** 66 hours = 12 days (assumes 5.5h/day)  
**Safe Case:** 75 hours = 15 days (assumes 5h/day + buffer)

---

## ✅ FINAL COMPLETION CHECKLIST

### Before Launch
- [ ] All Phase 1 tasks complete
- [ ] All Phase 2 tasks complete
- [ ] All Phase 3 tasks complete
- [ ] All Phase 4 tests passing
- [ ] Security hardening complete
- [ ] All 18 security issues fixed
- [ ] API documentation updated
- [ ] Database backed up
- [ ] Error monitoring enabled
- [ ] Logging configured

### Launch Day
- [ ] Deploy backend to production
- [ ] Deploy frontend to production
- [ ] Point domain to production
- [ ] Monitor errors/performance
- [ ] Team testing
- [ ] Public announcement

---

**Status:** Ready to begin Phase 1  
**Start Date:** February 8, 2026  
**Target Launch:** February 20-22, 2026
