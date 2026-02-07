# Data Storage

ShopDash stores data in JSON files under `server/data`.

## Files
- `products.json`
- `orders.json`
- `users.json`
- `shipping.json`
- `settings.json`
- `consents.json`
- `audit.json`
- `admin-alerts.json`

## Encryption
PII fields (email, phone, order contact details) are encrypted with AES-256-GCM
using `DATA_ENCRYPTION_KEY` from `.env`.
