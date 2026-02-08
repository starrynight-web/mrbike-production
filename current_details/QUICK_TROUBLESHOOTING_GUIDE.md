# 🆘 MrBikeBD - QUICK TROUBLESHOOTING & QUICK FIXES

## Quick Status Check

### Health Check Commands

```bash
# 1. Check Backend
curl http://localhost:8000/api/bikes/models/

# Expected: 200 OK with ~300 bikes
# If: 0 bikes → Run migration script
# If: Connection refused → Start Django server
# If: 404 → URL routing issue

# 2. Check Database
cd backend && python manage.py shell
>>> from apps.bikes.models import BikeModel
>>> print(f"Bikes: {BikeModel.objects.count()}")
# Expected: 300+
# If: 0 → Data not imported

# 3. Check Frontend Build
cd frontend && npm run build
# Expected: success
# If: TypeScript error → Fix type annotations

# 4. Check API Connection
curl -X GET http://localhost:8000/api/news/
# Expected: 200 OK with news articles
# If: 404 → Create apps/news/urls.py

# 5. Check Auth
curl -X POST http://localhost:8000/api/users/auth/google/ \
  -H "Content-Type: application/json" \
  -d '{"id_token":"test"}'
# Expected: 401 (invalid token)
# If: 500 → GOOGLE_CLIENT_ID missing
```

---

## Common Issues & Fixes

### ❌ Issue 1: "No Bikes Found" / Empty Database

**Symptoms:**
- Frontend shows empty page
- `GET /api/bikes/` returns 0 bikes
- Admin panel shows no bikes

**Root Causes & Fixes:**

```
Cause 1: Migration script not run
├─ Fix: python backend/scripts/migrate_bikes.py
├─ Verify: BikeModel.objects.count() should be 300+
└─ Check: frontend/src/app/mock/bikes.json exists

Cause 2: bikes.json file missing
├─ Fix: Ensure frontend/src/app/mock/bikes.json exists
├─ Or: Download from repository
└─ Or: Create sample bikes manually in Django admin

Cause 3: MongoDB not configured
├─ Fix: Set MONGODB_URI in .env
├─ Test: python -c "from pymongo import MongoClient; ..."
└─ Note: PostgreSQL is primary, MongoDB is secondary
```

**Quick Fix:**
```bash
cd backend
python manage.py shell

from apps.bikes.models import BikeModel, Brand
import json

# Load from JSON
with open('../frontend/src/app/mock/bikes.json') as f:
    data = json.load(f)

bikes = data['bikes'][:5]  # Import first 5 as test

for bike in bikes:
    brand, _ = Brand.objects.get_or_create(name=bike['brand'])
    BikeModel.objects.get_or_create(
        name=bike['name'],
        defaults={'brand': brand, 'category': 'commuter'}
    )

# Check
print(BikeModel.objects.count())  # Should show at least 5
```

---

### ❌ Issue 2: Google OAuth Login Not Working

**Symptoms:**
- Login page appears
- Click Google button → error
- Network tab shows 401/500

**Root Causes & Fixes:**

```
Cause 1: GOOGLE_CLIENT_ID missing
├─ Fix: Add to .env:
│  GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
│  GOOGLE_CLIENT_SECRET=xxxxx
├─ Restart: Django server
└─ Verify: curl shows token verification attempt

Cause 2: NextAuth not configured
├─ Fix: Create src/app/api/auth/[...nextauth]/route.ts
├─ Add: GoogleProvider with credentials
└─ Restart: Frontend dev server

Cause 3: Redirect URI mismatch
├─ Fix: In Google Cloud Console
├─ Add: http://localhost:3000/api/auth/callback/google
├─ Or: https://yourdomain.com/api/auth/callback/google
└─ Save and wait 5 minutes for propagation

Cause 4: JWT not enabled
├─ Fix: In backend/core/settings.py, uncomment:
│  'rest_framework_simplejwt.authentication.JWTAuthentication'
└─ Restart: Django server
```

**Debug Steps:**

```typescript
// In frontend, check session
import { useSession } from 'next-auth/react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  
  console.log('Session:', session);  // Should show user + tokens
  console.log('Status:', status);     // 'loading' → 'authenticated'
  
  return <div>Status: {status}</div>;
}
```

```bash
# In backend, test token
python manage.py shell

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.first()

refresh = RefreshToken.for_user(user)
print(f"Access: {refresh.access_token}")
print(f"Refresh: {refresh}")
```

---

### ❌ Issue 3: TypeScript Build Errors

**Symptoms:**
- `npm run build` fails
- Error: "Parameter 'X' implicitly has an 'any' type"
- Frontend won't deploy

**Root Cause & Fix:**

```typescript
// ❌ WRONG
const bikes = [...];
const filtered = bikes.filter(bike => bike.price > 1000);  // 'bike' is any

// ✅ CORRECT
interface Bike {
  id: string;
  name: string;
  price: number;
  category: string;
  // ... other fields
}

const bikes: Bike[] = [...];
const filtered = bikes.filter((bike: Bike) => bike.price > 1000);
```

**Auto-Fix:**

```bash
cd frontend

# 1. Enable strict mode in tsconfig.json
# Set: "strict": true

# 2. Run eslint fix
npm run lint -- --fix

# 3. Or use Pylance (VS Code)
# Install Pylance extension
# It will highlight untyped parameters

# 4. Build again
npm run build
```

**Find All Issues:**
```bash
npm run build 2>&1 | grep "Type error"
```

---

### ❌ Issue 4: API Endpoints Returning 404

**Symptoms:**
- GET /api/news/ → 404 Not Found
- GET /api/marketplace/listings/ → 404
- GET /api/bikes/{slug}/similar/ → 404

**Root Cause & Fix:**

```
Problem: URLs not registered in core/urls.py

Current core/urls.py is missing:
├─ path('api/news/', include('apps.news.urls'))
├─ path('api/marketplace/', include('apps.marketplace.urls'))
└─ path('api/interactions/', include('apps.interactions.urls'))

Fix:
1. Verify apps/news/urls.py exists (Create if missing)
2. Verify apps/marketplace/urls.py exists (Create if missing)
3. Add these lines to core/urls.py:

urlpatterns = [
    # ... existing paths ...
    path('api/news/', include('apps.news.urls')),
    path('api/marketplace/', include('apps.marketplace.urls')),
    path('api/interactions/', include('apps.interactions.urls')),
]

4. Restart Django
5. Test: curl http://localhost:8000/api/news/
```

**Verify URLs:**
```bash
python manage.py shell

from django.urls import get_resolver
urls = get_resolver()
print(urls.url_patterns)

# Check if these exist:
# - api/news/
# - api/marketplace/
# - api/interactions/
# - api/bikes/X/similar/
```

---

### ❌ Issue 5: "Connection to Backend Failed"

**Symptoms:**
- Frontend shows "Connection Error"
- API calls timeout
- Network tab shows no response

**Root Causes & Fixes:**

```
Cause 1: Django not running
├─ Fix: cd backend && python manage.py runserver
└─ Visit: http://localhost:8000

Cause 2: Wrong API_URL
├─ Fix: Check frontend .env.local:
│  NEXT_PUBLIC_API_URL=http://localhost:8000/api
├─ Or: NEXT_PUBLIC_API_URL=http://localhost:8000
└─ Restart: npm run dev

Cause 3: CORS not enabled
├─ Fix: In backend/core/settings.py:
│  CORS_ALLOW_ALL_ORIGINS = True  (dev only)
│  CORS_ALLOW_CREDENTIALS = True
└─ Restart: Django

Cause 4: Firewall blocking
├─ Windows: Allow port 8000 in Windows Firewall
├─ Mac: sudo lsof -i :8000 (find process)
└─ Linux: sudo ufw allow 8000

Cause 5: Port already in use
├─ Find: lsof -i :8000 (Mac/Linux)
│  netstat -ano | findstr :8000 (Windows)
└─ Kill & restart
```

**Debug:**

```bash
# 1. Check if backend is running
curl -v http://localhost:8000/api/bikes/models/

# 2. Check CORS headers
curl -H "Origin: http://localhost:3000" \
  http://localhost:8000/api/bikes/models/

# Should see: Access-Control-Allow-Origin: *

# 3. Check .env
cat .env | grep API
cat frontend/.env.local | grep API

# 4. Check frontend console
# Open DevTools → Console → Look for errors
```

---

### ❌ Issue 6: Database Locked / SQLite Errors

**Symptoms:**
- "Database is locked"
- "OperationalError: database disk image is malformed"
- Multiple processes trying to write

**Root Cause & Fix:**

```
Problem: SQLite doesn't support concurrent writes
Solution: Migrate to PostgreSQL immediately

Quick Temporary Fix:
├─ Close all Django processes
├─ Delete backend/db.sqlite3 (backup first!)
├─ Run migrations: python manage.py migrate
├─ Import bikes: python scripts/migrate_bikes.py
└─ Restart Django

Proper Fix:
1. Install PostgreSQL
2. Create database: createdb mrbikebd
3. Update .env: DATABASE_URL=postgresql://...
4. Run: python manage.py migrate
5. Import bikes again
6. Delete db.sqlite3
```

---

### ❌ Issue 7: Image Upload Not Working

**Symptoms:**
- Upload image → 400/500 error
- Image appears broken in frontend
- Cloudinary not configured

**Root Cause & Fix:**

```
Cause 1: Cloudinary not configured
├─ Fix: .env needs:
│  CLOUDINARY_CLOUD_NAME=xxx
│  CLOUDINARY_API_KEY=xxx
│  CLOUDINARY_API_SECRET=xxx
├─ Get from: https://cloudinary.com
└─ Restart: Django

Cause 2: Serializer not handling file upload
├─ Fix: Update apps/marketplace/serializers.py
├─ Add: image = serializers.ImageField(required=False)
└─ Handle multipart/form-data in view

Cause 3: Missing ListingImage handling
├─ Fix: Process images after listing creation
├─ Save to database via ListingImage model
└─ Return image URLs in response
```

---

### ❌ Issue 8: OTP Not Sending

**Symptoms:**
- Send OTP → no SMS received
- OTP modal stuck loading
- Firebase not initialized

**Root Cause & Fix:**

```
Cause 1: Firebase not initialized
├─ Fix: 
│  1. Download service account from Firebase Console
│  2. Save to backend/serviceAccountKey.json
│  3. Add to .env:
│     FIREBASE_SERVICE_ACCOUNT_JSON=/path/to/file.json
│  4. Restart Django

Cause 2: SMS provider not configured
├─ Options:
│  - Firebase Cloud Messaging (free tier limited)
│  - Twilio (paid)
│  - AWS SNS
├─ Fix: Configure provider in apps/users/services/otp_service.py
└─ For dev: Just log OTP to console (DEBUG mode)

Cause 3: Phone format invalid
├─ Expected: +880XXXXXXXXXXX or 880XXXXXXXXXXX
├─ Fix: Validate before sending
└─ Reject: 01XXXXXXXXX (missing country code)
```

**Development Testing:**

```python
# In settings.py, add:
DEBUG_OTP = True

# In otp_service.py:
if settings.DEBUG_OTP:
    logger.info(f"DEV OTP: {otp}")  # Log instead of send
    return True
```

---

## Quick Command Reference

```bash
# Database
python manage.py migrate                    # Run migrations
python manage.py makemigrations             # Create migrations
python manage.py shell                      # Django shell
python manage.py runserver                  # Start server

# Data
python manage.py createsuperuser            # Create admin
python manage.py loaddata fixture.json      # Load data
python scripts/migrate_bikes.py             # Import bikes

# Frontend
npm install                                 # Install deps
npm run dev                                 # Start dev server
npm run build                               # Build for prod
npm run lint                                # Check types

# Testing
curl http://localhost:8000/api/bikes/       # Test endpoint
python manage.py test                       # Run tests
npm test                                    # Frontend tests

# Debugging
python manage.py print_sql                  # Show SQL
tail -f backend/logs/debug.log              # View logs
docker logs container_name                  # Docker logs
```

---

## Emergency Restart Procedure

If everything is broken:

```bash
# 1. Kill all processes
pkill -f "python manage.py"
pkill -f "next dev"
pkill -f "node"

# 2. Reset database (dev only!)
cd backend
rm db.sqlite3
python manage.py migrate
python scripts/migrate_bikes.py

# 3. Clear cache
rm -rf frontend/.next
npm install --force

# 4. Start fresh
python manage.py runserver &     # Backend
cd ../frontend && npm run dev &  # Frontend

# 5. Verify
curl http://localhost:8000/api/bikes/models/  # Should show bikes
```

---

## When to Ask for Help

❌ Have you tried:
- [ ] Restarting Django?
- [ ] Clearing cache (rm -rf .next)?
- [ ] Checking .env variables?
- [ ] Running migrations?
- [ ] Checking logs for error messages?
- [ ] Testing with curl?

✅ If all above done, provide:
```
- Error message (full, from logs)
- Command that fails
- Expected vs actual output
- .env values (sanitized)
- Git branch/commit
```

---

**Last Updated:** 2026-02-02  
**Created By:** Development Team
