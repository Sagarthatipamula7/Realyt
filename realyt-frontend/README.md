# realyt-frontend

React frontend for Realyt.

## Goals

- Public booking experience for clients
- Internal dashboard for `ADMIN` and `EDITOR`
- Route-based gating using React Router
- OTP login experience with backend auth
- Availability calendar and booking flow

## Suggested structure

- `src/api/` — Axios requests
- `src/auth/` — `AuthContext`, `ProtectedRoute`
- `src/pages/client/` — landing, booking, order tracking
- `src/pages/editor/` — assignments, earnings
- `src/pages/admin/` — queue, editor directory, payments
- `src/components/` — shared UI components

## Initial work

1. Setup React app
2. Implement OTP modal and auth flow
3. Wire availability endpoint to calendar
4. Add protected routes for internal pages
