# Deployment

## Requirements
- Node.js 18+ (20 recommended)
- A process manager (pm2) or platform like Render/Fly/Heroku

## Build and run

```bash
npm install
npm run build
npm run server
```

Frontend can be served via Vite preview or a static host that proxies API calls.

## Environment

Copy `.env.example` to `.env` and fill all required values.

Recommended for production:
- `CORS_ORIGIN` set to your site origin
- `ADMIN_ORIGIN` set to your admin subdomain
- `TRUST_PROXY=1` if behind a proxy

## Admin subdomain

Point `admin.shopdash.com` to the same deployment and set:
- `ADMIN_ORIGIN=https://admin.shopdash.com`

This restricts admin traffic to that origin.
