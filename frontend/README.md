# PHS - Property Management System

A Swahili-first Progressive Web App (PWA) for property management in Kenya, built with React, TypeScript, and a Django REST backend.

## Overview

PHS (Property Housing System) is a mobile-first property management platform designed for landlords, tenants, and property managers in East Africa. The system supports offline-first operations, M-PESA payment integration, and provides a seamless experience even on low-bandwidth connections.

## Key Features

### For Landlords
- **Property & Unit Management**: Track multiple properties and rental units
- **Tenant Management**: Manage tenant information and lease agreements
- **Rent Collection**: Automated rent reminders and M-PESA payment tracking
- **Financial Dashboard**: Real-time occupancy rates, income tracking, and reports
- **Maintenance Tracking**: Receive and manage maintenance requests with photo attachments
- **Hall Bookings**: Manage communal space bookings and payments

### For Tenants
- **Digital Payments**: Pay rent via M-PESA STK Push
- **Maintenance Requests**: Submit issues with photos, track status
- **Lease Information**: View lease terms and payment history
- **Booking System**: Reserve communal halls and facilities

### Technical Features
- **Offline-First**: Works without internet, syncs when connected
- **PWA**: Installable on mobile devices, app-like experience
- **Swahili-First**: Primary language is Swahili with English fallback
- **Low-Data Optimized**: Efficient data usage for 2G/3G networks
- **Token-Based Auth**: Secure OTP authentication via SMS

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for styling
- **React Router v6** for navigation
- **React Query (TanStack)** for server state management
- **idb** for IndexedDB offline queue
- **Vite PWA Plugin** for service worker and caching
- **react-i18next** for internationalization
- **Lucide React** for icons

### Backend (Not included in this repo)
- Django REST Framework
- Token Authentication
- M-PESA Daraja API integration
- SMS Gateway (Twilio/Infobip)

### Backend
- **Django REST Framework** with JWT auth (SimpleJWT)

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API running (Django REST)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd phs-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8000
VITE_PWA_NAME=PHS
VITE_DEFAULT_LANG=sw
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The optimized build will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
/src
  /api
    client.ts              # API client with auth token handling
  /components
    /ui
      Button.tsx           # Reusable button component
      Input.tsx            # Form input component
      Card.tsx             # Card container component
    /layout
      Header.tsx           # App header with navigation
      Nav.tsx              # Navigation component
      Footer.tsx           # App footer
  /pages
    Auth.tsx               # OTP authentication page
    Dashboard.tsx          # Main dashboard with metrics
    PropertiesList.tsx     # Property listing page
    PropertyDetail.tsx     # Single property with units
    TenantProfile.tsx      # Tenant information page
    Payments.tsx           # Payment history and actions
    Maintenance.tsx        # Maintenance request form/list
    BookingCalendar.tsx    # Hall booking calendar
  /hooks
    useAuth.ts             # Authentication hook
    useOfflineQueue.ts     # Offline action queue
    useSync.ts             # Data synchronization
  /i18n
    index.ts               # i18n configuration
    en.json                # English translations
    sw.json                # Swahili translations (primary)
  /utils
    idb-helpers.ts         # IndexedDB utilities
    date.ts                # Date formatting helpers
  main.tsx                 # App entry point
  App.tsx                  # Root component
  index.css                # Global styles
```

## Backend API Endpoints

The frontend expects these Django REST endpoints:

### Authentication
- `POST /api/accounts/users/otp_request/` - Request OTP code
- `POST /api/accounts/users/otp_verify/` - Verify OTP and get token

### Properties
- `GET /api/properties/` - List all properties
- `POST /api/properties/` - Create property
- `GET /api/properties/{id}/` - Get property details
- `PUT /api/properties/{id}/` - Update property

### Units
- `GET /api/units/` - List units
- `POST /api/units/` - Create unit
- `GET /api/units/{id}/` - Get unit details

### Dashboard
- `GET /api/dashboard/summary/` - Get dashboard metrics

### Payments (Future)
- `POST /api/payments/initiate/` - Start M-PESA STK push
- `GET /api/payments/history/` - Payment history

### Maintenance (Future)
- `POST /api/maintenance/` - Submit maintenance request
- `GET /api/maintenance/` - List maintenance tickets

## Offline Capabilities

The app uses a service worker and IndexedDB to provide offline functionality:

1. **App Shell Caching**: Static assets cached for instant loading
2. **API Response Caching**: GET requests cached with stale-while-revalidate
3. **Offline Queue**: POST/PUT requests queued when offline, synced when online
4. **Background Sync**: Automatic retry of failed requests

### Using the Offline Queue

```typescript
import { useOfflineQueue } from '@/hooks/useOfflineQueue';

const { enqueue } = useOfflineQueue();

// Queue an action when offline
await enqueue({
  url: '/api/maintenance/',
  method: 'POST',
  body: { title: 'Broken pipe', description: '...' },
  meta: { type: 'maintenance_request' }
});
```

## Internationalization (i18n)

The app is Swahili-first with English fallback.

### Adding Translations

Edit `src/i18n/sw.json` and `src/i18n/en.json`:

```json
{
  "login": "Ingia",
  "phone": "Nambari ya simu",
  "send_otp": "Tuma OTP",
  "verify_otp": "Thibitisha OTP",
  "dashboard": "Dashibodi",
  "properties": "Mali",
  "pay_now": "Lipa sasa"
}
```

### Using Translations

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <button>{t('pay_now')}</button>;
}
```

## Authentication Flow

1. User enters phone number
2. System sends OTP via SMS (backend)
3. User enters OTP code
4. Backend verifies and returns auth token
5. Token stored in localStorage
6. Token sent in `Authorization: Token <token>` header for all API requests

## PWA Installation

The app can be installed on mobile devices:

1. Open the app in a mobile browser
2. Tap "Add to Home Screen" (iOS) or install prompt (Android)
3. App opens in standalone mode like a native app

### PWA Features
- Offline support
- Background sync
- Push notifications (future)
- App icon and splash screen

## Testing

### Run Type Checking
```bash
npm run typecheck
```

### Run Linter
```bash
npm run lint
```

### Unit Tests (to be added)
```bash
npm test
```

## Deployment

### Deploy to Netlify
1. Build the project: `npm run build`
2. Deploy `dist/` folder to Netlify
3. Set environment variables in Netlify dashboard

### Deploy to Vercel
1. Connect GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically on push

### Deploy to DigitalOcean App Platform
1. Create new app from GitHub
2. Configure build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

## Security Considerations

- Auth tokens stored in localStorage (consider httpOnly cookies for production)
- CORS configured on Django backend for frontend origin
 
- Input validation on all forms
- Image compression before upload
- No sensitive data in client-side code

## Performance Optimization

- Code splitting with React Router
- Lazy loading of routes
- Image optimization and compression
- Service worker caching
- React Query for efficient data fetching
- Tailwind CSS purging for minimal bundle size

## Browser Support

- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- Mobile browsers (iOS Safari 14+, Android Chrome 90+)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [repository-url]/issues
- Email: support@phsapp.co.ke

## Roadmap

### Phase 1 (Current)
- [x] Project scaffold
- [x] Basic routing
- [ ] Auth flow with OTP
- [ ] Dashboard with metrics
- [ ] Properties CRUD
- [ ] Offline queue

### Phase 2
- [ ] M-PESA payment integration
- [ ] Maintenance request flow
- [ ] Hall booking system
- [ ] Push notifications
- [ ] Advanced reporting

### Phase 3
- [ ] Multi-language support (add more languages)
- [ ] Bulk SMS notifications
- [ ] Document management
- [ ] Analytics dashboard
- [ ] Mobile app (React Native version)

## Acknowledgments

- Built with Vite React TS
- UI components inspired by Shadcn/ui
- Icons from Lucide React
- Translation support from the Swahili-speaking community

---

**Built with ❤️ for East African property managers**
