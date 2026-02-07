# ShopDash

ShopDash is a lightweight ecommerce dashboard + storefront built with React and an Express API. It uses JSON files for storage, includes admin and customer dashboards, and supports mobile money checkout flows.

## Highlights
- Product, order, shipping, and settings management
- Customer accounts (email or phone) with preferences and order history
- Admin authentication with audit logs and security controls
- Cookie consent management and privacy tooling
- Read-only data viewer for JSON datasets

## Stack
- Frontend: React, Vite, Tailwind
- Backend: Express (JSON file storage)

## Getting started

1) Install dependencies
```bash
npm install
```

2) Create environment file
```bash
cp .env.example .env
```

3) Generate secrets
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Paste the output into `.env` as `DATA_ENCRYPTION_KEY`.

4) Start the app
```bash
npm start
```

Frontend: http://localhost:5173
API: http://localhost:4000

## Environment variables

Set these in `.env`:

Required
- `JWT_SECRET` - user session signing key
- `ADMIN_JWT_SECRET` - admin session signing key
- `DATA_ENCRYPTION_KEY` - 32-byte hex/base64 key for encrypting PII

Generate the required secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Run it three times and paste the outputs into the three variables above.

Recommended
- `ADMIN_BOOTSTRAP_PASSWORD` - one-time bootstrap password for first admin login
- `CORS_ORIGIN` - comma-separated allowed origins for the API
- `ADMIN_ORIGIN` - the admin site origin (e.g. https://admin.shopdash.com)

Optional
- `RESEND_API_KEY` - email service for admin alerts and order updates
- `VITE_FLW_PUBLIC_KEY` / `FLW_SECRET_KEY` - Flutterwave mobile money integration
- `ADMIN_SESSION_TTL_MINUTES`, `ADMIN_SESSION_IDLE_MINUTES`,
  `ADMIN_SESSION_ROTATE_MINUTES`, `ADMIN_MAX_FAILED_ATTEMPTS`, `ADMIN_LOCK_MINUTES`

## Routes

Storefront
- `/`
- `/products`
- `/products/:id`
- `/cart`
- `/checkout`
- `/login`
- `/signup`
- `/privacy`
- `/terms`

Customer dashboard
- `/dashboard`
- `/dashboard/orders`
- `/dashboard/preferences`

Admin
- `/admin/login`
- `/admin`
- `/admin/products`
- `/admin/orders`
- `/admin/shipping`
- `/admin/settings`

Data viewer (read-only)
- `/admin-data`

## Scripts
- `npm run dev` - start frontend
- `npm run server` - start API server
- `npm start` - start both
- `npm run build` - build frontend
- `npm run lint` - lint

## Notes
- JSON data lives in `server/data`.
- Admin security uses httpOnly cookies, CSRF protection, audit logs, and session rotation.
- Encrypted fields require a stable `DATA_ENCRYPTION_KEY`.

## Docs
- `docs/ARCHITECTURE.md`
- `docs/DEPLOYMENT.md`
- `docs/API.md`
- `docs/SECURITY_OVERVIEW.md`
- `docs/DATA_STORAGE.md`
- `docs/ENV.md`
