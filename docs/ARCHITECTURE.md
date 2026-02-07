# Architecture

## Overview
ShopDash is a React + Express application that stores data in JSON files. The frontend consumes the API server for products, orders, settings, and auth.

## Frontend
- React (Vite)
- Tailwind for UI
- Context providers for settings, auth, cart, and theme

## Backend
- Express API
- JSON storage in `server/data`
- Admin + user auth using httpOnly cookies
- CSRF protection for write operations
- Audit logging for admin and user actions

## Data flow
1. UI calls the API with credentials.
2. Server validates input and checks auth.
3. Server persists to JSON and returns sanitized data.
4. UI renders updated state.
