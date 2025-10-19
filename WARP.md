# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Monorepo with a Django REST API (backend/) and a Vite + React + TypeScript PWA (frontend/).
- Auth: phone-based OTP -> JWT (SimpleJWT). DRF defaults to IsAuthenticated; clients send Authorization: Bearer <access>.
- Core domain: Property, Unit, TenantProfile, Lease. DRF ViewSets expose CRUD under /api/.
- Dev DB: SQLite (config/settings.py). CORS allows http://localhost:5173 by default.
- Frontend Axios client reads base URL from VITE_API_URL (defaults to http://localhost:8000), and attaches access_token from localStorage.

Common commands
Backend (Django + DRF)
- Create/activate venv and install deps
```bash path=null start=null
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows PowerShell: . .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```
- Run migrations and dev server
```bash path=null start=null
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```
- Create superuser (owner role is default for superuser in manager)
```bash path=null start=null
python manage.py createsuperuser
```
- Lint/format
```bash path=null start=null
ruff check backend
ruff format backend
black backend
```
- Tests (Django’s built-in test runner)
```bash path=null start=null
# All tests
python manage.py test
# Single app
python manage.py test apps.accounts
# Single test case or test method (example pattern)
python manage.py test apps.accounts.tests.TestAuthViews.test_otp_request
```

Frontend (Vite + React + TS + Tailwind)
- Install deps and run dev server
```bash path=null start=null
cd frontend
npm install
npm run dev
```
- Build, preview, lint
```bash path=null start=null
npm run build
npm run preview
npm run lint
```
- Set API base URL (optional; default is http://localhost:8000)
```bash path=null start=null
# Create frontend/.env.local
# VITE_API_URL=http://localhost:8000
```

High-level architecture and routing
Backend
- Project: backend/config (settings, urls). Apps under backend/apps/.
- Auth: apps/accounts
  - Custom User (phone unique, roles: owner/manager/tenant). OTP endpoints:
    - POST /api/auth/otp_request/ { phone } → caches 6-digit OTP for OTP_TTL_SECONDS
    - POST /api/auth/otp_verify/ { phone, otp } → returns { user, tokens }
  - JWT via rest_framework_simplejwt; DRF permissions default to IsAuthenticated.
- Domain APIs (registered via DRF router in config/urls.py):
  - /api/properties (apps.properties.PropertyViewSet)
  - /api/units (apps.properties.UnitViewSet)
  - /api/tenants (apps.tenants.TenantProfileViewSet)
  - /api/leases (apps.leases.LeaseViewSet)
- Models (selected):
  - Property(owner, name, type, address, currency)
  - Unit(property→Property, code, unit_type, rent_amount, deposit, area, status)
  - TenantProfile(user→accounts.User, business_name, id_number, phone, email)
  - Lease(unit→Unit, tenant→TenantProfile, start/end, rent_amount, frequency, deposit, signed_document_url, is_active)

Frontend
- Vite + React Router entry in frontend/src/main.tsx and frontend/src/App.tsx, with basic routes: /, /properties, /auth.
- Axios client at frontend/src/api/client.ts: attaches Authorization bearer if access_token is present; baseURL from VITE_API_URL.
- Tailwind configured via tailwind.config.js; content scans index.html and src/**/*.{ts,tsx}.

Cross-service dev flow
```bash path=null start=null
# Terminal 1: backend
cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && python manage.py migrate && python manage.py runserver 0.0.0.0:8000
# Terminal 2: frontend
cd frontend && npm install && npm run dev
```

Notes
- CORS in settings allows http://localhost:5173 and 3000; adjust if your frontend runs elsewhere.
- Axios default baseURL matches Django dev server; override via VITE_API_URL in frontend/.env.local when needed.
