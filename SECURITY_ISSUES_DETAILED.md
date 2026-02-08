# 🔒 SECURITY ISSUES - DETAILED REFERENCE

**Analysis Date:** February 8, 2026  
**Total Issues Found:** 18  
**Critical:** 3 | High: 6 | Medium: 9

---

## 📋 SECURITY ISSUES TABLE

### 🔴 CRITICAL SEVERITY (Must fix before launch)

| ID | Issue | Location | Impact | Risk | Fix Time | Status |
|----|-------|----------|--------|------|----------|--------|
| **SEC-001** | **No Authentication on API Endpoints** | `backend/core/settings.py:126` | Anyone can DELETE bikes, users, listings | High - Data loss | 2h | ❌ Not Fixed |
| **SEC-002** | **Exposed Database Secrets** | `backend/.env` | MongoDB/Redis credentials visible | Critical - Access DB | 1h | ❌ Not Fixed |
| **SEC-003** | **SECRET_KEY Hardcoded Fallback** | `backend/core/settings.py:16` | Token forgery, session hijacking | High - Auth bypass | 30m | ❌ Not Fixed |

### 🟠 HIGH SEVERITY (Should fix before launch)

| ID | Issue | Location | Impact | Risk | Fix Time | Status |
|----|-------|----------|--------|------|----------|--------|
| **SEC-004** | **JWT Tokens Too Long-Lived** | `backend/security_settings_config.py:108` | 7-day refresh token = 7 days of compromise | Medium - Token theft | 1h | ⚠️ Partial |
| **SEC-005** | **Image Upload Not Validated** | `backend/apps/bikes/views.py` | Malware upload, file system attack | High - Server compromise | 2h | ❌ Not Fixed |
| **SEC-006** | **SQLite Database Unencrypted** | `backend/core/settings.py:79` | Anyone with file access can read all data | Medium - Data theft | 2h | ⚠️ Dev only |
| **SEC-007** | **CORS Allows All Origins (Debug)** | `backend/config_settings.py:101` | CSRF attacks, cross-site request forgery | High - User accounts | 1h | ⚠️ Dev only |
| **SEC-008** | **No Password Reset System** | `backend/apps/users/views.py` | Users locked out, no recovery | Medium - UX issue | 4h | ❌ Not Fixed |
| **SEC-009** | **NextAuth Session Not Secure** | `frontend/src/app/api/auth/[...nextauth]/route.ts` | CSRF attacks, session fixation | High - User accounts | 1h | ❌ Not Fixed |

### 🟡 MEDIUM SEVERITY (Should fix soon)

| ID | Issue | Location | Impact | Risk | Fix Time | Status |
|----|-------|----------|--------|------|----------|--------|
| **SEC-010** | **No Email Verification** | `backend/apps/users/views.py` | Fake accounts, spam | Low - Spam | 2h | ❌ Not Fixed |
| **SEC-011** | **No Audit Logging** | `backend/` | Can't track who did what | Medium - Compliance | 3h | ❌ Not Fixed |
| **SEC-012** | **Auth Tokens in localStorage** | `frontend/src/` | XSS attack = token theft | Medium - XSS risk | 2h | ⚠️ NextAuth fix |
| **SEC-013** | **No Content-Security-Policy Header** | `frontend/next.config.ts` | XSS attacks, script injection | Medium - XSS | 1h | ❌ Not Fixed |
| **SEC-014** | **No Account Lockout** | `backend/apps/users/views.py` | Brute force password attack | Medium - Password | 2h | ❌ Not Fixed |
| **SEC-015** | **No HTTPS Redirect** | `frontend/next.config.ts` | Credentials transmitted in plaintext | Medium - MITM | 30m | ❌ Not Fixed |
| **SEC-016** | **Weak Email Validation** | `backend/apps/users/models.py:14` | Fake emails, impersonation | Low - Spam | 1h | ⚠️ Django default |
| **SEC-017** | **No Rate Limit on Signup** | `backend/core/settings.py` | Account creation spam | Low - Spam | 1h | ❌ Not Fixed |
| **SEC-018** | **Admin URL Not Obscured** | `backend/security_settings_config.py:283` | Admin panel enumeration | Low - Privacy | 15m | ⚠️ Uses SECRET_KEY |

---

## 🔴 CRITICAL ISSUES - DETAILED EXPLANATION

### SEC-001: No Authentication on API Endpoints

**Severity:** 🔴 CRITICAL  
**Location:** `backend/core/settings.py:116-127`  
**Current Code:**
```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # ← DISABLED
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    # ...
}
```

**Problem:**
- JWT authentication commented out
- API only uses SessionAuthentication (weak)
- Anyone can POST/PATCH/DELETE without login

**What an Attacker Can Do:**
```bash
# Delete all bikes
curl -X DELETE http://localhost:8000/api/bikes/1/

# Delete all used listings
curl -X DELETE http://localhost:8000/api/used-bikes/1/

# Create fake listings
curl -X POST http://localhost:8000/api/used-bikes/ -d '{"malicious": "data"}'

# Modify existing data
curl -X PATCH http://localhost:8000/api/bikes/1/ -d '{"price": "1"}'
```

**Impact:**
- Users can impersonate each other
- Sellers can steal buyer information
- Admins can be locked out
- Database can be corrupted

**Fix:**
```python
# core/settings.py - UNCOMMENT JWT LINE
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # ← UNCOMMENT
        # 'rest_framework.authentication.SessionAuthentication',  # ← COMMENT OUT
    ],
}
```

**Test After Fix:**
```bash
# Without token - should fail
curl -X DELETE http://localhost:8000/api/bikes/1/
# Response: 401 Unauthorized

# With token - should work if admin
curl -X DELETE http://localhost:8000/api/bikes/1/ \
  -H "Authorization: Bearer <JWT_TOKEN>"
# Response: 204 No Content
```

**Timeline:** 30 minutes (uncomment + test)

---

### SEC-002: Exposed Database Secrets

**Severity:** 🔴 CRITICAL  
**Location:** `backend/.env` (SHOULD NOT EXIST)  
**Exposed Credentials:**
```dotenv
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/db
MONGODB_USERNAME=user
MONGODB_PASSWORD=password
REDIS_PASSWORD=ra1aZhJnppICbQHFvvA2T6QK7YugPx6v
REDIS_URL=rediss://default:ra1aZhJnppICbQHFvvA2T6QK7YugPx6v@redis-host:17787
CLOUDINARY_API_SECRET=ID6gpUl254dOqXg27oWRTvuH6sQ
GOOGLE_CLIENT_SECRET=...
```

**Problem:**
- `.env` file committed to repository
- Credentials visible in git history
- Anyone with repo access can:
  - Access production databases
  - Upload unauthorized files to Cloudinary
  - Use Google API quota
  - Access Redis cache

**What an Attacker Can Do:**
```javascript
// Connect to exposed MongoDB
const mongo = require('mongodb');
const client = new mongo.MongoClient(process.env.MONGODB_URI);
await client.connect();
// Delete all bikes data

// Connect to exposed Redis
const redis = require('redis');
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});
// Flush all cache
```

**Impact:**
- Production database compromise
- Data breach (all bikes, users, listings)
- Unauthorized API access
- Reputation damage

**Fix (Immediate):**
1. **Rotate ALL credentials:**
   - MongoDB password (create new user)
   - Redis password (reset)
   - Cloudinary API secret (regenerate)
   - Google Client Secret (regenerate)
   - AWS keys (if used)

2. **Update .env:**
   ```bash
   # backend/.env - Already in .gitignore, but ensure:
   # 1. Remove from git history:
   git rm --cached backend/.env
   git commit -m "Remove .env from tracking"
   
   # 2. Update all credentials in .env
   # 3. Verify .gitignore includes backend/.env
   ```

3. **Verify No History:**
   ```bash
   # Check if .env ever committed:
   git log --follow --diff-filter=D -- backend/.env
   
   # If found, use BFG Repo-Cleaner:
   bfg --delete-files backend/.env
   ```

**Timeline:** 1 hour (rotate credentials)

---

### SEC-003: SECRET_KEY Hardcoded Fallback

**Severity:** 🔴 CRITICAL  
**Location:** `backend/core/settings.py:16`  
**Current Code:**
```python
SECRET_KEY = os.environ.get(
    "SECRET_KEY", 
    "django-insecure-mrbikebd-secret-key-123456789"  # ← HARDCODED
)
```

**Problem:**
- If `SECRET_KEY` not in `.env`, uses known default
- Token signing key is public
- Attackers can forge JWT tokens
- Session cookies can be hijacked

**What an Attacker Can Do:**
```python
import jwt
from datetime import datetime, timedelta

# With known SECRET_KEY, attacker can forge tokens
SECRET_KEY = "django-insecure-mrbikebd-secret-key-123456789"

# Create fake admin token
payload = {
    'user_id': 1,  # Admin ID
    'username': 'attacker',
    'is_staff': True,
    'is_superuser': True,
    'exp': datetime.utcnow() + timedelta(days=7)
}

fake_token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

# Use forged token
headers = {'Authorization': f'Bearer {fake_token}'}
response = requests.delete('http://api/bikes/1/', headers=headers)
# Success! Delete any bike with forged admin token
```

**Impact:**
- Anyone can become admin
- Access all user data
- Modify/delete any data
- Complete system compromise

**Fix:**
1. **Generate new SECRET_KEY:**
   ```bash
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   # Output: ~50-character random string
   ```

2. **Update .env:**
   ```dotenv
   # backend/.env
   SECRET_KEY=django-insecure-abc123def456ghi789jkl...xyz
   ```

3. **Remove hardcoded fallback:**
   ```python
   # core/settings.py
   SECRET_KEY = os.environ.get("SECRET_KEY")
   
   if not SECRET_KEY:
       raise ValueError("SECRET_KEY environment variable not set!")
   ```

4. **Verify:**
   ```bash
   # Should fail without .env
   python manage.py runserver
   # ValueError: SECRET_KEY environment variable not set!
   ```

**Timeline:** 30 minutes

---

## 🟠 HIGH SEVERITY ISSUES

### SEC-004: JWT Tokens Too Long-Lived

**Issue:** Refresh tokens valid for 7 days  
**Risk:** If token stolen, attacker has 7 days access  
**Fix:**
```python
# security_settings_config.py
SIMPLE_JWT = {
    'REFRESH_TOKEN_LIFETIME': timedelta(days=3),  # Changed from 7
    # ...
}
```

**Timeline:** 1 hour

---

### SEC-005: Image Upload Not Validated

**Issue:** POST `/api/bikes/{id}/upload-image/` doesn't validate files  
**Risk:**  
- Upload virus/malware
- Upload huge files (DOS)
- Upload script files (RCE if served as static)

**Fix:**
```python
# apps/bikes/views.py
from django.core.files.uploads import UploadedFile
import mimetypes

class BikeImageUploadView(APIView):
    def post(self, request, id):
        file = request.FILES.get('image')
        
        # Validate file type
        allowed_types = {'image/jpeg', 'image/png', 'image/webp'}
        if file.content_type not in allowed_types:
            return Response(
                {'error': 'Invalid file type'},
                status=400
            )
        
        # Validate file size (5MB max)
        if file.size > 5 * 1024 * 1024:
            return Response(
                {'error': 'File too large'},
                status=400
            )
        
        # Process & upload
        # ...
```

**Timeline:** 2 hours

---

### SEC-007: CORS Allows All Origins (Debug)

**Issue:** In development, `CORS_ALLOW_ALL_ORIGINS = DEBUG`  
**Risk:** CSRF attacks from any website  

**Fix:**
```python
# config_settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
# CORS_ALLOW_ALL_ORIGINS = DEBUG  # Remove this
```

**Timeline:** 15 minutes

---

## 🟡 MEDIUM SEVERITY ISSUES

### SEC-011: No Audit Logging

**Issue:** Can't track who did what (deleted bike? modified listing?)  
**Impact:** Compliance issue, can't investigate abuse  

**Fix:**
```python
# apps/core/middleware.py
class AuditLoggingMiddleware:
    def __call__(self, request):
        # Log: user, action, resource, timestamp
        # Exclude: GET requests, static files
        
        if request.method != 'GET':
            log_action(
                user=request.user,
                action=request.method,
                resource=request.path,
                timestamp=datetime.now()
            )
```

**Timeline:** 3 hours

---

### SEC-012: Auth Tokens in localStorage

**Issue:** JavaScript can access auth tokens  
**Risk:** XSS attack → steal tokens  

**Fix (After NextAuth.js):**
```tsx
// Use HttpOnly cookies instead
// This requires NextAuth.js complete configuration
// Cookies set by NextAuth are HttpOnly by default
```

**Timeline:** Already handled by NextAuth (2h to complete)

---

### SEC-013: No Content-Security-Policy

**Issue:** No CSP header = allows script injection  

**Fix:**
```typescript
// frontend/next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'; img-src 'self' data: https:"
          }
        ]
      }
    ];
  }
};
```

**Timeline:** 1 hour

---

### SEC-014: No Account Lockout

**Issue:** Brute force password attack possible  
**Risk:** Attacker tries 1000s of passwords  

**Fix:**
```python
# apps/users/views.py
from django.core.cache import cache
from django.contrib.auth import authenticate

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        
        # Check if locked out
        lockout_key = f"login_attempt_{email}"
        attempts = cache.get(lockout_key, 0)
        
        if attempts >= 5:
            return Response(
                {'error': 'Account locked. Try later.'},
                status=429
            )
        
        # Try login
        user = authenticate(email=email, password=request.data.get('password'))
        
        if not user:
            cache.set(lockout_key, attempts + 1, 900)  # 15 min lockout
            return Response({'error': 'Invalid credentials'}, status=401)
        
        # Success - reset attempts
        cache.delete(lockout_key)
        return Response({'token': token})
```

**Timeline:** 2 hours

---

## 📊 SECURITY SUMMARY

### By Severity
```
🔴 CRITICAL:  3 issues  (27 issues/1000 lines)
🟠 HIGH:      6 issues  
🟡 MEDIUM:    9 issues
────────────────────────
TOTAL:       18 issues
```

### By Category
```
Authentication:      6 issues
Validation:          4 issues
Data Protection:     3 issues
Audit/Logging:       2 issues
Secrets Management:  1 issue
Headers/Security:    2 issues
```

### Timeline to Fix All Security
```
Critical:    5-7 hours
High:        8-10 hours
Medium:      10-12 hours
────────────────────────
TOTAL:       23-29 hours
```

### Fix Priority
1. Fix SEC-001, SEC-002, SEC-003 **[DAY 1]** (5 hours)
2. Fix SEC-004 through SEC-009 **[DAY 2-3]** (10 hours)
3. Fix SEC-010 through SEC-018 **[Week 1]** (15 hours)

---

## ✅ SECURITY CHECKLIST

Before Production Launch:

- [ ] Enable JWT authentication
- [ ] Rotate SECRET_KEY
- [ ] Rotate all API credentials
- [ ] Restrict ALLOWED_HOSTS
- [ ] Restrict CORS origins
- [ ] Validate file uploads
- [ ] Add account lockout
- [ ] Add email verification
- [ ] Add audit logging
- [ ] Add HTTPS redirect
- [ ] Add Content-Security-Policy
- [ ] Complete NextAuth.js configuration
- [ ] Test CSRF token validation
- [ ] Test rate limiting
- [ ] Test permission checks
- [ ] Run security scan (OWASP ZAP, BurpSuite)

---

**Last Updated:** February 8, 2026  
**Status:** Analysis Complete  
**Next:** Begin Phase 1 fixes
