## Property Handling System (PHS) — Phase 1

A Swahili‑first Property Handling System for landlords and property managers in Tanzania (Mwanza focus). Mobile‑first React PWA + Django REST backend, PostgreSQL, and mobile money integrations. This README contains the project blueprint and developer quickstart.

### Stack
- **Frontend**: React + TypeScript (Vite), Tailwind, React Router, React Query, PWA (Workbox/Vite PWA), i18n (react‑i18next), IndexedDB (idb)
- **Backend**: Django, Django REST Framework, Celery, Redis, django‑storages + S3, SimpleJWT
- **DB**: PostgreSQL
- **Integrations**: M‑Pesa (STK + webhooks), Tigo Pesa, Airtel Money, SMS/WhatsApp (Twilio/Infobip), Push (FCM/Web Push)
- **Infra**: Docker, docker‑compose, GitHub Actions (CI), S3‑compatible storage

### Audience & Value
- **Users**: Owners/Managers (malls, buildings, halls, street‑level landlords) and Tenants
- **Problems**: Poor visibility, cash/no receipts, hard payments, no Swahili‑first tools
- **Value**: Unified tenant/property/billing/maintenance/booking, mobile money, Swahili‑first PWA, dashboards

---

### Phase 1 Scope (Features)
- **Property & Unit Management**: properties, units
- **Tenant & Lease Management**: tenants, digital leases, lifecycle
- **Payments & Billing**: invoices, payment tracking, mobile money, receipts (SMS/PDF)
- **Maintenance**: tenant requests, assign, status, costs, photos
- **Hall Bookings**: calendar bookings with online payment
- **Dashboard**: income, occupancy, arrears (simple visuals)
- **Notifications**: SMS, WhatsApp, Push
- **User Roles**: Owner / Manager / Tenant
- **Localization**: Swahili default, English toggle

Non‑Phase 1: parking, advanced BI/forecasting, marketplace integrations

### Non‑Functional
- PWA offline (service worker, IndexedDB queue/cache)
- Low bandwidth (lean bundles, pagination, lazy load)
- Security (JWT, RBAC, HTTPS, secure token storage)
- Data residency (EA region), accessibility (large fonts/icons, simple flows)
- Scalability (modular Django apps, horizontal scale)

---

### Architecture

```
React PWA  <->  Django REST API  <->  PostgreSQL
   |                 |                 |
Service Worker   Celery + Redis     S3 Storage
IndexedDB        SMS/WhatsApp       Payments (M‑Pesa/Airtel/Bank)
Push (FCM)       Email/Jops         Webhooks
```

Components:
- Frontend: React TS PWA with i18n and offline patterns
- Backend: Django + DRF, Celery, Redis
- Storage: PostgreSQL, S3‑compatible object storage
- Notifications: SMS/WhatsApp/Push
- Payments: M‑Pesa STK + webhooks (others via flags)

---

### Data Model (Core Entities)
1. User: phone, email, name, role, is_active
2. Property: owner, name, address, type, currency, photos
3. Unit: property, code, unit_type, rent_amount, status, deposit, area
4. TenantProfile: user, business_name, id_number, contacts, photo
5. Lease: unit, tenant, dates, rent_amount, frequency, deposit, signed_doc_url
6. Invoice: lease/ad‑hoc, amount, status, due_date, paid_at, method, external_ref
7. Payment: invoice, amount, transaction_id, method, status, reconciled
8. MaintenanceRequest: unit, tenant, title, description, photos, status, assigned_to, cost
9. Booking: hall unit, time, booked_by, price, status, payment_ref
10. Notification: user, type, content, sent_at, read_at

---

### API Sketch (REST)
- Auth
  - POST `/api/auth/otp_request/` { phone }
  - POST `/api/auth/otp_verify/` { phone, otp }
  - POST `/api/auth/login/`

- Properties & Units
  - GET/POST `/api/properties/`, GET/PUT `/api/properties/{id}/`
  - GET/POST `/api/properties/{id}/units/`, PUT `/api/units/{id}/`

- Tenants & Leases
  - GET/POST `/api/tenants/`
  - GET/POST `/api/leases/`, POST `/api/leases/{id}/renew/`

- Payments & Invoices
  - GET `/api/invoices/?status=due`
  - POST `/api/invoices/{id}/pay/`
  - POST `/api/payments/webhook/mpesa/`

- Maintenance
  - GET/POST `/api/maintenance/`, PUT `/api/maintenance/{id}/assign/`

- Bookings
  - GET `/api/bookings/?property=xx`, POST `/api/bookings/`

- Dashboard
  - GET `/api/dashboard/summary/?property_id=xx`

- Notifications
  - POST `/api/notifications/send/`

---

### Monorepo Layout

```
backend/
  README.md
  Dockerfile
  docker-compose.yml
  manage.py
  requirements.txt
  config/
  apps/
    accounts/
    properties/
    tenants/
    leases/
    payments/
    maintenance/
    bookings/
    notifications/
    reports/
  scripts/
  tests/

frontend/
  public/
  src/
    api/
    hooks/
    pages/
      Dashboard/
      Properties/
      Units/
      Tenants/
      Payments/
      Maintenance/
      Bookings/
      Auth/
    components/
      ui/
      layout/
      forms/
    services/
    styles/
    utils/
```

---

### Backend Plan (Django)
1) Bootstrap
   - venv, install deps: django, drf, psycopg2‑binary, cors, simplejwt, celery, redis, environ, boto3, django‑storages
   - `django-admin startproject config .`, create apps per layout
   - configure settings: INSTALLED_APPS, REST_FRAMEWORK, CORS, DB via env

2) Accounts & Auth
   - Custom `User` (phone unique, roles: owner/manager/tenant)
   - OTP: `/auth/otp_request/`, `/auth/otp_verify/` using Redis TTL
   - JWT via SimpleJWT

3) Core Models
   - properties.Property & Unit; tenants.TenantProfile; leases.Lease
   - payments.Invoice, Payment; maintenance.MaintenanceRequest; bookings.Booking

4) Admin & Views
   - register models; list filters; inlines for units under property

5) REST APIs
   - DRF router + viewsets; serializers; permissions (RBAC)

6) Payments
   - M‑Pesa STK initiation + webhook; reconciliation; manual cash/bank entries

7) Tasks & Notifications
   - Celery tasks for SMS/WhatsApp/email; reminders; nightly jobs

8) Tests & Quality
   - unit + API tests; black/ruff

9) Dockerization
   - compose: web, worker, redis, postgres, storage

10) Env
   - `.env` keys: `DJANGO_SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`, `MPESA_*`, `SMS_API_KEY`

---

### Frontend Plan (React PWA)
1) Bootstrap
   - `npm create vite@latest frontend -- --template react-ts`
   - deps: react-router-dom@6, axios, @tanstack/react-query, idb, react-i18next, i18next, tailwindcss, @vite/pwa, recharts, react-hook-form, yup

2) Auth Flow
   - phone OTP pages; call `/api/auth/otp_request/` + `/api/auth/otp_verify/`
   - store JWT (access in memory, refresh via httpOnly cookie if used); axios interceptors

3) PWA & Offline
   - cache shell; persist React Query cache to IndexedDB
   - action queue for maintenance/booking when offline; background sync

4) UI Pages
   - Dashboard, Properties, Units, Tenants, Payments, Maintenance, Bookings, Auth
   - Swahili‑first i18n content; accessible components

---

### Quickstart (Local Dev)

Prereqs: Python 3.11+, Node 18+, Docker, Make (optional)

Backend
```
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Frontend
```
cd frontend
npm install
npm run dev -- --host
```

Docker (recommended for all services)
```
docker compose up --build
```

Environment
```
cp .env.example .env  # fill values
```

---

### Acceptance Criteria (Samples)
- Landlord creates property and units; dashboard shows units
- Tenant logs in via OTP, views lease, sees due invoice
- M‑Pesa STK push succeeds; webhook marks invoice paid; dashboard updates
- Tenant submits maintenance offline; sync posts ticket with photos on reconnect

---

### Developer Workflow
- Branches: `feature/<area>`
- Commits: small, descriptive
- Tests: alongside features
- Style: black (py), prettier (ts)
- Secrets: `.env` only; never commit
- PRs: include testing notes and screenshots

---

### License
Proprietary (internal project). Update as needed.


