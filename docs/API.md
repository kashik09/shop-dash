# API

Base URL: `http://localhost:4000/api`

## Auth
- User session cookie: `session`
- Admin session cookie: `admin_session`
- CSRF token: fetch `/api/csrf` and send `x-csrf-token` on write requests

## Endpoints

### Auth
- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

### Admin auth
- `POST /admin-auth/login`
- `GET /admin-auth/me`
- `POST /admin-auth/logout`

### Products
- `GET /products`
- `POST /products`
- `PATCH /products/:id`
- `DELETE /products/:id`

### Orders
- `GET /orders`
- `GET /orders/:id`
- `POST /orders`
- `PATCH /orders/:id`
- `DELETE /orders/:id`

### Settings
- `GET /settings`
- `PUT /settings`
- `PATCH /settings/store`
- `PATCH /settings/notifications`
- `PATCH /settings/cookies`

### Admin data (read-only)
- `GET /admin-data?dataset=users|orders|products|categories|shipping|settings|consents|audit|admin-alerts|admins`
