# 🔧 QUICK ISSUES & SOLUTIONS REFERENCE

**Last Updated:** February 10, 2026

---

## 🔴 CRITICAL ISSUES TO FIX NOW

### Issue #1: Exposed MongoDB Credentials
**Status:** 🔴 CRITICAL - Fix immediately  
**Location:** `backend/.env` line 23-27  
**Severity:** High - Database can be accessed by attackers

**Current Situation:**
```
MONGODB_URI=mongodb+srv://skywatcher181_db_user:wbCXigDIu2FuSQZd@cluster0.grorcos.mongodb.net/...
MONGODB_PASSWORD=wbCXigDIu2FuSQZd
```

**Actions Required:**
1. Go to MongoDB Atlas (https://cloud.mongodb.com/)
2. Login with admin account
3. Find user "skywatcher181_db_user"
4. Delete and create new user with random password
5. Copy new connection string
6. Update `backend/.env` with new credentials
7. Restart Django backend
8. Consider not storing .env in git (add to .gitignore)

**Time:** 20-30 minutes  
**Impact:** High - Prevents database compromise

---

### Issue #2: Hardcoded SECRET_KEY Fallback
**Status:** 🔴 CRITICAL - Fix immediately  
**Location:** `backend/core/settings.py` line 15  
**Severity:** Critical - Token forgery possible

**Current Code:**
```python
SECRET_KEY = os.environ.get("SECRET_KEY", "django-insecure-mrbikebd-secret-key-123456789")
```

**Problem:** If .env file missing, defaults to predictable key

**Fix:**
```python
# In terminal:
cd backend
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
# Copy output

# In backend/.env, add:
SECRET_KEY=<paste-generated-key-here>

# Remove the default from settings.py:
SECRET_KEY = os.environ.get("SECRET_KEY")  # No default
```

**Time:** 5-10 minutes  
**Impact:** Critical - Prevents token forgery

---

### Issue #3: TypeScript Build Error (used-bike-filters)
**Status:** ⚠️ BLOCKING - Build fails  
**Location:** `frontend/src/components/used-bikes/used-bike-filters.tsx:212`  
**Severity:** High - Prevents deployment

**Error:**
```
Type error: Parameter 'brand' implicitly has an 'any' type.
```

**Location in Code:**
Around line 212 where `.map()` or filter uses `brand` parameter

**Fix:**
```typescript
// Find the line with brand parameter (around 212-220)
// Before:
brands.map(brand => {...})

// After - add type:
brands.map((brand: Brand) => {...})

// Or at the top of component, import/define Brand type:
import { Brand } from '@/types';  // or define interface Brand
```

**Time:** 5-15 minutes  
**Impact:** High - Blocks `npm run build`

---

### Issue #4: SSR Error in Profile Page
**Status:** ⚠️ BLOCKING - Build fails  
**Location:** `frontend/src/app/profile/profile-client.tsx`  
**Severity:** High - Runtime error, next build fails

**Error:**
```
ReferenceError: location is not defined
```

**Problem:** Browser API used during server-side rendering

**Fix:**
```typescript
// If using 'location' object (browser window):
'use client';  // Add at top if missing

// Or guard with typeof check:
if (typeof window !== 'undefined') {
  const url = window.location.href;
}

// Or use Next.js useRouter instead:
import { useRouter } from 'next/navigation';
const router = useRouter();
```

**Time:** 10-15 minutes  
**Impact:** High - Blocks build

---

### Issue #5: Database Data Import Failed
**Status:** 🔴 NOT WORKING - No data imported  
**Location:** `backend/apps/bikes/management/commands/import_bikes.py`  
**Severity:** High - Database appears empty to users

**Current Status:**
```
Database: 39 bikes, 18 brands (incomplete set)
Expected: 300+ bikes
Migration Error: "Collection objects do not implement truth value testing"
```

**Root Cause:**
```python
# Line in migration script:
if mongo_collection:  # ← This fails for MongoDB collections
```

**Fix:**
```python
# Change to:
if mongo_collection is not None:

# Or check count:
if mongo_collection.count_documents({}) > 0:
```

**Time:** 30-60 minutes  
**Impact:** High - Users see empty catalog

---

## 🟠 HIGH PRIORITY ISSUES

### Issue #6: API Not Connected to Frontend
**Status:** 🟡 NOT WIRED - Uses mock data  
**Location:** Multiple pages (home, used-bikes, search)  
**Severity:** High - Users see fake data

**Pages Using Mock Data:**
- `/` (home page) - Hardcoded featured bikes
- `/used-bikes` - Shows empty instead of listing
- `/bikes` - Uses local filter state

**Fix Approach:**
```typescript
// Before:
const bikes = MOCK_BIKES;  // hardcoded

// After:
const [bikes, setBikes] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchBikes = async () => {
    try {
      const res = await fetch(`${API_URL}/bikes/`);
      const data = await res.json();
      setBikes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  fetchBikes();
}, []);

// Return with loading state
if (loading) return <Spinner />;
```

**Pages to Update:**
1. `src/app/page.tsx` - Home
2. `src/app/bikes/catalogue-client.tsx` - Bike listing
3. `src/app/used-bikes/page.tsx` - Used bikes
4. `src/app/news/news-client.tsx` - News

**Time:** 3-4 hours  
**Impact:** High - Core functionality

---

### Issue #7: JWT Authentication Status Unclear
**Status:** ⚠️ UNCLEAR - Needs verification  
**Location:** `backend/core/settings.py:130`  
**Severity:** Critical - Affects API security

**Current Status:**
```python
'DEFAULT_AUTHENTICATION_CLASSES': [
    'rest_framework_simplejwt.authentication.JWTAuthentication',  # Listed
    'rest_framework.authentication.SessionAuthentication',
    'rest_framework.authentication.BasicAuthentication',
],
```

**Verification Script:**
```bash
cd backend
python manage.py shell
>>> from rest_framework_simplejwt.tokens import RefreshToken
>>> from apps.users.models import User
>>> user = User.objects.first()
>>> refresh = RefreshToken.for_user(user)
>>> print(refresh.access_token)  # Should work
>>> # Test without token:
>>> import requests
>>> requests.delete('http://localhost:8000/api/bikes/1/')
>>> # Should get 401 Unauthorized
```

**Time:** 30-60 minutes  
**Impact:** Critical - API security

---

### Issue #8: Authentication System Missing
**Status:** 🔴 NOT IMPLEMENTED - 0% complete  
**Location:** Multiple locations  
**Severity:** Critical - Users can't login

**Missing Components:**
1. OTP generation & SMS sending
2. User registration API
3. NextAuth.js configuration
4. Password reset flow
5. Email verification

**Required Implementations:**
```python
# Backend: apps/users/views.py
class SendOTPView(APIView):
    def post(self, request):
        phone = request.data.get('phone')
        # Generate 6-digit code
        code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        # Cache/store for 5 min
        cache.set(f'otp_{phone}', code, timeout=300)
        # Send SMS
        send_sms(phone, f"Your OTP: {code}")
        return Response({'message': 'OTP sent'})

class VerifyOTPView(APIView):
    def post(self, request):
        phone = request.data.get('phone')
        otp = request.data.get('otp')
        cached_otp = cache.get(f'otp_{phone}')
        if cached_otp == otp:
            # Create/login user
            user, _ = User.objects.get_or_create(phone=phone)
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            })
        return Response({'error': 'Invalid OTP'}, status=400)
```

**Time:** 4-6 hours  
**Impact:** Critical - No user authentication

---

## 🟡 MEDIUM PRIORITY ISSUES

### Issue #9: TypeScript Type Safety
**Status:** 🟡 PARTIAL - Some files typed  
**Location:** Multiple frontend files  
**Severity:** Medium - Code quality

**Files needing type fixes:**
- `src/components/used-bikes/used-bike-filters.tsx`
- `src/app/profile/profile-client.tsx`
- Any `.map()` or filter without proper types

**Pattern to apply:**
```typescript
// Define interfaces
interface Bike {
  id: number;
  name: string;
  price: number;
  brand: string;
  category: string;
}

// Use in functions
const handleBike = (bike: Bike) => { ... }
bikes.map((bike: Bike) => (...))
```

**Time:** 1-2 hours  
**Impact:** Medium - Build quality

---

### Issue #10: Image Upload Not Integrated
**Status:** ⏳ CODE EXISTS - Not fully tested  
**Location:** `backend/apps/bikes/views.py`  
**Severity:** Medium

**Current State:**
```python
# Endpoint exists: POST /api/bikes/upload_image/
# But uses conditional ImageProcessingService imports
# May not work without Cloudinary setup
```

**Fixes Needed:**
1. Test image upload manually
2. Verify file validation
3. Check image processing
4. Add testing

**Time:** 1-2 hours  
**Impact:** Medium - Admin feature

---

### Issue #11: Email Not Configured
**Status:** ❌ NOT CONFIGURED - No email sending  
**Location:** `backend/core/settings.py`  
**Severity:** Medium

**Missing Configuration:**
```python
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'smtp.gmail.com'
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = 'your-email@gmail.com'
# EMAIL_HOST_PASSWORD = 'app-password'
```

**Time:** 30-60 minutes  
**Impact:** Medium - Email features

---

## 📋 ISSUES SUMMARY TABLE

| # | Issue | Severity | Status | Time | Impact |
|---|-------|----------|--------|------|--------|
| 1 | MongoDB Credentials Exposed | 🔴 CRITICAL | ❌ Not Fixed | 20m | High |
| 2 | SECRET_KEY Hardcoded | 🔴 CRITICAL | ❌ Not Fixed | 10m | Critical |
| 3 | TypeScript Build Error (filters) | 🟠 HIGH | ❌ Not Fixed | 10m | High |
| 4 | Profile SSR Error | 🟠 HIGH | ❌ Not Fixed | 15m | High |
| 5 | Data Import Failed | 🟠 HIGH | ❌ Not Fixed | 1h | High |
| 6 | API Not Connected | 🟠 HIGH | ❌ Not Wired | 4h | High |
| 7 | JWT Status Unclear | 🔴 CRITICAL | ⚠️ Unclear | 1h | Critical |
| 8 | Auth System Missing | 🔴 CRITICAL | ❌ Not Impl | 6h | Critical |
| 9 | Type Safety Issues | 🟡 MEDIUM | ⚠️ Partial | 2h | Medium |
| 10 | Image Upload | 🟡 MEDIUM | ⏳ Partial | 2h | Medium |
| 11 | Email Config | 🟡 MEDIUM | ❌ Not Config | 1h | Medium |

---

## ✅ ISSUES NOT PRESENT (Good News)

These documented issues are actually NOT problems:
```
✅ TypeScript Error on line 119 of catalogue-client.tsx
   → Already has proper Bike type annotation
   → Not actually broken

✅ Database connection
   → SQLite works fine for development
   → Migrations all applied successfully

✅ API endpoints structure
   → All viewsets implemented
   → Routes properly registered
   
✅ Frontend components
   → 40+ components built
   → Responsive design working
   → Admin interface production-ready
```

---

## 🎯 RECOMMENDED FIX ORDER

**First Hour:**
1. Rotate MongoDB credentials (SECURITY)
2. Generate new SECRET_KEY
3. Verify JWT working

**First Day:**
1. Fix TypeScript errors (3 errors)
2. Fix SSR issue in profile
3. Verify all APIs respond

**First Week:**
1. Implement OTP system
2. Wire frontend to real API
3. Implement user auth
4. Import proper data
5. Security audit of 18 issues

**Before Launch:**
1. Test all features
2. Load testing
3. Mobile testing
4. Deploy to staging
5. Go-live

---

**Total Time to Fix All Issues:** ~35-40 hours (4-5 work days)
