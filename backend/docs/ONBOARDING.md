# MrBikeBD - Developer Onboarding

## Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS, Zustand.
- **Backend**: Django 5.x, DRF, PostgreSQL (Supabase), Redis.
- **Tasks**: Django-Q2.
- **Media**: Cloudinary.

## Development Setup

### 1. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Architectural Standards
1. **Thin Views**: Use the Service Layer (`services.py`) for all business logic.
2. **Type Safety**: All frontend API calls must use specific interfaces from `@/types`.
3. **Atomic Operations**: Use `transaction.atomic()` for all multi-step database writes.
4. **ISR Revalidation**: When updating core data, trigger the Next.js revalidate webhook via `core.services.revalidate_tags`.

## Security Protocols
- Never hardcode secrets. Use `.env`.
- Use `IsSuperAdminOnly` for all administrative endpoints.
- All user inputs must be sanitized using `bleach`.
