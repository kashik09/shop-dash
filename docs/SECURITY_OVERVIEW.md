# Security Overview

## Controls in place
- Admin and user authentication via httpOnly cookies
- CSRF protection on write endpoints
- Rate limiting and security headers
- Audit logging of admin and user actions
- Encrypted PII at rest (AES-256-GCM)
- Admin origin enforcement via `ADMIN_ORIGIN`
- Session rotation and idle timeouts for admins
- Account lockout after failed admin logins
- Admin security alerts (stored + optional email)

## Secrets
- `JWT_SECRET`
- `ADMIN_JWT_SECRET`
- `DATA_ENCRYPTION_KEY`

Rotate secrets only with a migration plan. Changing `DATA_ENCRYPTION_KEY` will break decryption of existing data.
