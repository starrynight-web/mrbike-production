# 🔧 MrBikeBD - TECHNICAL IMPLEMENTATION GUIDE

## Table of Contents
1. Database Setup
2. Authentication Flow
3. API Implementation
4. Frontend Integration
5. Testing & Deployment

---

## 1️⃣ DATABASE SETUP

### 1.1 PostgreSQL Configuration

**Step 1: Install PostgreSQL**
```bash
# Windows
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/

# Create database
createdb -U postgres mrbikebd
```

**Step 2: Update .env**
```dotenv
DEBUG=True
SECRET_KEY=django-insecure-mrbikebd-secret-key-123456789
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://postgres:password@localhost:5432/mrbikebd
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mrbikebd
REDIS_URL=redis://localhost:6379/1
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FIREBASE_SERVICE_ACCOUNT_JSON=/path/to/serviceAccountKey.json
SENTRY_DSN=your_sentry_dsn
```

**Step 3: Update settings.py**

Replace in `core/settings.py` lines 79-84:
```python
# Database
DATABASES = {
    'default': dj_database_url.config(
        default='postgresql://postgres:password@localhost:5432/mrbikebd',
        conn_max_age=600,
        conn_health_checks=True,
    )
}
```

**Step 4: Run Migrations**
```bash
cd backend
python manage.py migrate
```

**Expected output:**
```
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  ...
  Operations to perform:
    ...
  Running migrations:
    ...
  Applied 25 migrations in 2.34s
```

---

### 1.2 MongoDB Setup

**Step 1: Create MongoDB Atlas Cluster**
1. Visit https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string:
   ```
   mongodb+srv://user:password@cluster.mongodb.net/mrbikebd
   ```

**Step 2: Update .env**
```dotenv
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mrbikebd
MONGODB_DB_NAME=mrbikebd
```

**Step 3: Test Connection**
```python
from pymongo import MongoClient
import os

mongo_client = MongoClient(os.getenv("MONGODB_URI"))
db = mongo_client['mrbikebd']
print(db.list_collection_names())  # Should show collections
```

---

### 1.3 Import Bike Data

**File: backend/scripts/migrate_bikes.py**

Create/Update this file:
```python
import os
import sys
import json
import django
from pathlib import Path
from pymongo import MongoClient
from django.utils.text import slugify
import logging

# Setup Django
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from apps.bikes.models import BikeModel, Brand
from django.utils import timezone

logger = logging.getLogger(__name__)

def migrate_bikes():
    print("[START] Starting Bike Data Migration...")
    
    # Load bikes.json from frontend
    json_path = BASE_DIR.parent / "frontend" / "src" / "app" / "mock" / "bikes.json"
    
    if not json_path.exists():
        print(f"[ERROR] {json_path} not found!")
        return
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    bikes_list = data.get('bikes', [])
    print(f"[INFO] Found {len(bikes_list)} bikes in JSON")
    
    # MongoDB Setup
    mongo_client = MongoClient(settings.MONGODB_URI)
    mongo_db = mongo_client['mrbikebd']
    mongo_bikes = mongo_db['bikes']
    
    migrated_count = 0
    
    for bike_json in bikes_list:
        try:
            # Get or create brand
            brand_name = bike_json.get('brand', 'Unknown')
            brand, _ = Brand.objects.get_or_create(
                name=brand_name,
                defaults={'slug': slugify(brand_name)}
            )
            
            # Create bike in PostgreSQL
            bike, created = BikeModel.objects.update_or_create(
                slug=slugify(f"{brand_name}-{bike_json['name']}"),
                defaults={
                    'brand': brand,
                    'name': bike_json['name'],
                    'category': bike_json.get('category', 'commuter'),
                    'engine_capacity': int(bike_json.get('cc', 0)),
                    'engine_type': bike_json.get('engineType', ''),
                    'max_power': bike_json.get('power', ''),
                    'max_torque': bike_json.get('torque', ''),
                    'curb_weight': float(bike_json.get('weight', 0)),
                    'fuel_capacity': float(bike_json.get('fuelCapacity', 0)),
                    'price': float(bike_json.get('price', 0)),
                    'primary_image': bike_json.get('image', ''),
                    'popularity_score': int(bike_json.get('popularity', 50)),
                }
            )
            
            # Store full data in MongoDB
            mongo_data = {
                'slug': bike.slug,
                'brand': brand_name,
                'name': bike_json['name'],
                'category': bike_json.get('category', 'commuter'),
                'cc': int(bike_json.get('cc', 0)),
                'price': float(bike_json.get('price', 0)),
                'mileage': int(bike_json.get('mileage', 0)),
                'power': bike_json.get('power', ''),
                'torque': bike_json.get('torque', ''),
                'weight': float(bike_json.get('weight', 0)),
                'specs': bike_json.get('specs', {}),
                'image': bike_json.get('image', ''),
                'updated_at': timezone.now(),
            }
            
            # Upsert to MongoDB
            mongo_bikes.update_one(
                {'slug': bike.slug},
                {'$set': mongo_data},
                upsert=True
            )
            
            migrated_count += 1
            print(f"✓ {bike.name}")
            
        except Exception as e:
            print(f"✗ Failed {bike_json.get('name')}: {str(e)}")
    
    print(f"\n✅ Migration complete: {migrated_count}/{len(bikes_list)} bikes")
    
    # Verify
    bike_count = BikeModel.objects.count()
    mongo_count = mongo_bikes.count_documents({})
    print(f"PostgreSQL: {bike_count} bikes")
    print(f"MongoDB: {mongo_count} bikes")

if __name__ == "__main__":
    migrate_bikes()
```

**Run Migration:**
```bash
cd backend
python scripts/migrate_bikes.py
```

**Verify:**
```bash
python manage.py shell

>>> from apps.bikes.models import BikeModel
>>> BikeModel.objects.count()
300  # Should be ~300
```

---

## 2️⃣ AUTHENTICATION SETUP

### 2.1 Google OAuth Configuration

**Step 1: Create Google OAuth Credentials**

1. Visit: https://console.cloud.google.com
2. Create new project: "MrBikeBD"
3. Go to Credentials → Create OAuth 2.0 Client ID
4. Choose "Web application"
5. Add URIs:
   - Authorized redirect URIs:
     - http://localhost:3000/api/auth/callback/google
     - http://localhost:3000
     - https://mrbikebd.com/api/auth/callback/google
     - https://mrbikebd.com

6. Copy credentials to .env:
```dotenv
GOOGLE_CLIENT_ID=xxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxxxxxxx
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxxxx.apps.googleusercontent.com
```

**Step 2: Enable JWT in Django**

Update `backend/core/settings.py` line 136:

```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # ← ENABLE THIS
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}
```

**Step 3: Update User Serializer**

Update `backend/apps/users/serializers.py`:

```python
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 
                  'profile_image', 'location', 'is_phone_verified', 'date_joined']
        read_only_fields = ['id', 'date_joined']

class GoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField()
    email = serializers.EmailField(required=False)
    name = serializers.CharField(required=False, allow_blank=True)
```

**Step 4: Test Google OAuth**

```bash
# Test token verification (get token from Google)
curl -X POST "http://localhost:8000/api/users/auth/google/" \
  -H "Content-Type: application/json" \
  -d '{"id_token": "your_google_token_here"}'
```

---

### 2.2 Phone OTP Setup

**Step 1: Install Firebase**

```bash
cd backend
pip install firebase-admin
```

**Step 2: Get Firebase Service Account**

1. Visit: https://firebase.google.com
2. Create project or use existing
3. Go to Project Settings → Service Accounts
4. Generate new private key (JSON)
5. Save to: `backend/serviceAccountKey.json`

**Step 3: Create OTP Service**

Create `backend/apps/users/services/otp_service.py`:

```python
import firebase_admin
from firebase_admin import credentials, db as firebase_db
import os
import random
import string
from django.conf import settings
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

# Initialize Firebase
try:
    service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON', 
                                     'serviceAccountKey.json')
    if os.path.exists(service_account_path):
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
    else:
        logger.warning("Firebase service account not found")
except ValueError:
    logger.warning("Firebase already initialized")

class OTPService:
    OTP_LENGTH = 6
    OTP_EXPIRY = 300  # 5 minutes
    MAX_ATTEMPTS = 3
    
    @staticmethod
    def generate_otp():
        """Generate 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=OTPService.OTP_LENGTH))
    
    @staticmethod
    def send_otp(phone_number: str) -> bool:
        """Send OTP via Firebase (mock or real)"""
        otp = OTPService.generate_otp()
        
        # Cache OTP with expiry
        cache_key = f"otp:{phone_number}"
        cache.set(cache_key, otp, OTPService.OTP_EXPIRY)
        
        # Cache attempt counter
        attempt_key = f"otp_attempts:{phone_number}"
        cache.set(attempt_key, 0, OTPService.OTP_EXPIRY)
        
        try:
            # In development, just log
            if settings.DEBUG:
                logger.info(f"OTP for {phone_number}: {otp}")
                return True
            
            # In production, use Firebase Cloud Messaging or Twilio
            # For now: just cache
            return True
            
        except Exception as e:
            logger.error(f"Failed to send OTP to {phone_number}: {str(e)}")
            return False
    
    @staticmethod
    def verify_otp(phone_number: str, otp: str) -> bool:
        """Verify OTP"""
        cache_key = f"otp:{phone_number}"
        attempt_key = f"otp_attempts:{phone_number}"
        
        # Check attempts
        attempts = cache.get(attempt_key, 0)
        if attempts >= OTPService.MAX_ATTEMPTS:
            logger.warning(f"Max OTP attempts exceeded for {phone_number}")
            return False
        
        # Check OTP
        cached_otp = cache.get(cache_key)
        if cached_otp is None:
            logger.warning(f"OTP expired for {phone_number}")
            return False
        
        if cached_otp != otp:
            cache.set(attempt_key, attempts + 1, OTPService.OTP_EXPIRY)
            logger.warning(f"Invalid OTP for {phone_number}")
            return False
        
        # Valid - clear cache
        cache.delete(cache_key)
        cache.delete(attempt_key)
        logger.info(f"OTP verified for {phone_number}")
        return True
```

**Step 4: Add OTP Views**

Update `backend/apps/users/views.py`:

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .services.otp_service import OTPService
import logging

logger = logging.getLogger(__name__)

class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        phone = request.data.get('phone')
        
        if not phone:
            return Response(
                {'error': 'Phone number required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate phone format (Bangladesh)
        if not phone.startswith('+880') and not phone.startswith('88'):
            return Response(
                {'error': 'Invalid Bangladesh phone number'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Send OTP
        if OTPService.send_otp(phone):
            return Response(
                {'message': 'OTP sent successfully'},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Failed to send OTP'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VerifyOTPView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        phone = request.data.get('phone')
        otp = request.data.get('otp')
        
        if not phone or not otp:
            return Response(
                {'error': 'Phone and OTP required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify OTP
        if OTPService.verify_otp(phone, otp):
            # Update user
            user = request.user
            user.phone = phone
            user.is_phone_verified = True
            user.save()
            
            return Response(
                {'message': 'Phone verified successfully'},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Invalid OTP'},
                status=status.HTTP_400_BAD_REQUEST
            )
```

---

## 3️⃣ API IMPLEMENTATION

### 3.1 Create Missing URL Files

**Create: `backend/apps/news/urls.py`**
```python
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ArticleListView, ArticleDetailView

urlpatterns = [
    path('', ArticleListView.as_view(), name='article-list'),
    path('<slug:slug>/', ArticleDetailView.as_view(), name='article-detail'),
]
```

**Create: `backend/apps/marketplace/urls.py`**
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsedBikeListingViewSet

router = DefaultRouter()
router.register(r'listings', UsedBikeListingViewSet, basename='listing')

urlpatterns = [
    path('', include(router.urls)),
]
```

**Update: `backend/apps/interactions/urls.py`**
```python
from django.urls import path
from .views import BikeReviewListView, WishlistToggleView, WishlistListView

urlpatterns = [
    path('wishlist/', WishlistListView.as_view(), name='wishlist-list'),
    path('wishlist/toggle/<int:bike_id>/', WishlistToggleView.as_view(), name='wishlist-toggle'),
    path('bikes/<int:bike_id>/reviews/', BikeReviewListView.as_view(), name='bike-reviews'),
]
```

**Update: `backend/core/urls.py`**
```python
from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="MrBikeBD API",
      default_version='v1',
      description="Backend API for MrBikeBD ecosystem",
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/bikes/', include('apps.bikes.urls')),
    path('api/marketplace/', include('apps.marketplace.urls')),
    path('api/news/', include('apps.news.urls')),
    path('api/interactions/', include('apps.interactions.urls')),
    path('api/recommendations/', include('apps.recommendations.urls')),
    
    # Swagger Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
```

### 3.2 Add Similar Bikes Endpoint

**Update: `backend/apps/bikes/views.py`**

```python
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Brand, BikeModel
from .serializers import BrandSerializer, BikeModelSerializer
from apps.recommendations.engine import EmotionalRecommendationEngine

class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brand.objects.all().order_by('name')
    serializer_class = BrandSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'origin']

class BikeModelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BikeModel.objects.all().order_by('-popularity_score', 'name')
    serializer_class = BikeModelSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'brand', 'engine_capacity']
    search_fields = ['name', 'brand__name']
    ordering_fields = ['price', 'popularity_score', 'engine_capacity']
    lookup_field = 'slug'
    
    @action(detail=True, methods=['get'])
    def similar(self, request, slug=None):
        """Get similar bikes"""
        engine = EmotionalRecommendationEngine()
        similar_bikes = engine.get_similar_bikes(slug)
        return Response(similar_bikes)
```

---

## 4️⃣ FRONTEND INTEGRATION

### 4.1 NextAuth.js Setup

**Create: `frontend/src/app/api/auth/[...nextauth]/route.ts`**

```typescript
import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

interface CustomToken extends JWT {
  accessToken?: string;
  refreshToken?: string;
}

interface CustomSession extends Session {
  accessToken?: string;
  refreshToken?: string;
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account?.id_token) return false;

      try {
        // Call backend to create/update user
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/auth/google/`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_token: account.id_token }),
          }
        );

        if (!response.ok) {
          console.error('Backend auth failed:', response.statusText);
          return false;
        }

        const data = await response.json();
        user.accessToken = data.access;
        user.refreshToken = data.refresh;

        return true;
      } catch (error) {
        console.error('SignIn error:', error);
        return false;
      }
    },

    async jwt({ token, user }: { token: CustomToken; user?: any }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },

    async session({ session, token }: { session: CustomSession; token: CustomToken }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### 4.2 Update API Service

**Update: `frontend/src/lib/api-service.ts`**

```typescript
import axios, { AxiosInstance } from 'axios';
import { getSession } from 'next-auth/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiService {
  public client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add JWT token
    this.client.interceptors.request.use(async (config: any) => {
      try {
        const session = await getSession();
        if (session && (session as any).accessToken) {
          config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - redirect to login
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth APIs
  async loginWithGoogle(idToken: string) {
    return this.client.post('/users/auth/google/', { id_token: idToken });
  }

  async sendOTP(phone: string) {
    return this.client.post('/users/auth/otp/send/', { phone });
  }

  async verifyPhone(phone: string, otp: string) {
    return this.client.post('/users/auth/verify-phone/', { phone, otp });
  }

  // Bike APIs
  async getBikes(params = {}) {
    return this.client.get('/bikes/models/', { params });
  }

  async getBikeBySlug(slug: string) {
    return this.client.get(`/bikes/models/${slug}/`);
  }

  async getSimilarBikes(slug: string) {
    return this.client.get(`/bikes/models/${slug}/similar/`);
  }

  async getBrands() {
    return this.client.get('/bikes/brands/');
  }

  // News APIs
  async getNews(params = {}) {
    return this.client.get('/news/', { params });
  }

  async getArticleBySlug(slug: string) {
    return this.client.get(`/news/${slug}/`);
  }

  // Marketplace APIs
  async getUsedBikes(params = {}) {
    return this.client.get('/marketplace/listings/', { params });
  }

  async createUsedBike(data: FormData) {
    return this.client.post('/marketplace/listings/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Interaction APIs
  async getWishlist() {
    return this.client.get('/interactions/wishlist/');
  }

  async toggleWishlist(bikeId: string | number) {
    return this.client.post(`/interactions/wishlist/toggle/${bikeId}/`);
  }

  async getBikeReviews(bikeId: string | number) {
    return this.client.get(`/interactions/bikes/${bikeId}/reviews/`);
  }

  async createReview(bikeId: string | number, data: any) {
    return this.client.post(`/interactions/bikes/${bikeId}/reviews/`, data);
  }
}

export const api = new ApiService();
```

---

## 5️⃣ TESTING & DEPLOYMENT

### 5.1 Backend Testing

**Test Endpoints:**
```bash
# Start server
cd backend
python manage.py runserver

# In another terminal, test endpoints:

# 1. Test bikes endpoint
curl -X GET "http://localhost:8000/api/bikes/models/" \
  -H "Content-Type: application/json"

# Expected: 300+ bikes

# 2. Test bike detail
curl -X GET "http://localhost:8000/api/bikes/models/honda-cbr-150r/" \
  -H "Content-Type: application/json"

# 3. Test similar bikes
curl -X GET "http://localhost:8000/api/bikes/models/honda-cbr-150r/similar/" \
  -H "Content-Type: application/json"

# 4. Test news
curl -X GET "http://localhost:8000/api/news/" \
  -H "Content-Type: application/json"
```

### 5.2 Frontend Testing

**Fix TypeScript Errors First:**
```bash
cd frontend
npm run build
# Should complete without errors
```

**Start Development:**
```bash
npm run dev
# Visit http://localhost:3000
```

**Test Login Flow:**
1. Click "Login" button
2. Choose "Google"
3. Sign in with Google account
4. Should redirect to profile page

---

### 5.3 Deployment

**Backend (DigitalOcean):**
```bash
# 1. Create droplet
# 2. SSH into droplet
ssh root@your_ip

# 3. Clone repo
git clone https://github.com/yourname/mrbikebd.git
cd mrbikebd/backend

# 4. Setup
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 5. Environment
cp .env.example .env
# Edit with production values

# 6. Database
python manage.py migrate

# 7. Static files
python manage.py collectstatic --noinput

# 8. Run with Gunicorn
gunicorn core.wsgi:application --bind 0.0.0.0:8000
```

**Frontend (Vercel):**
```bash
# 1. Push to GitHub
git push origin main

# 2. Connect repo to Vercel
# Visit https://vercel.com
# Connect GitHub repo
# Add environment variables (NEXT_PUBLIC_API_URL, etc)

# 3. Deploy
# Automatically deploys on push
```

---

**Last Updated:** 2026-02-02  
**Next Step:** Database migration
