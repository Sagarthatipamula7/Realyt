# Realyt

## Java Spring Boot + React Development Plan

### Final Architecture

Two domains:

- **Client Frontend (React)** — public booking experience.
- **Internal App (React, role-gated)** — one app with two roles: **ADMIN** and **EDITOR**.
- **Spring Boot backend** exposing a REST API.
- **PostgreSQL database**.

Directory structure:

```
realyt/
├── realyt-backend/          (Spring Boot)
└── realyt-frontend/         (React)
    ├── client/               (public booking site)
    └── internal/             (admin + editor, role-gated)
```

Use one React app with route-based separation (`/`, `/app/admin/*`, `/app/editor/*`) instead of two separate frontend projects.

---

## Backend: Spring Boot

### Core dependencies

- Spring Web
- Spring Data JPA
- PostgreSQL Driver
- Spring Security
- Spring Boot Starter Mail
- Validation
- Lombok
- jjwt (`io.jsonwebtoken`)
- Stripe Java SDK (`com.stripe:stripe-java`)

### Entity model

- `User` — email, role, createdAt, optional `EditorProfile` / `ClientProfile`
- `Order` — client, occasionType, requestedDate, status, rawFootageUrls, briefNotes, budgetTier
- `Assignment` — order, editor, assignedDate, status
- `Message` — order, senderRole, body, sentAt
- `Payment` — order, amountTotal, platformCommission, editorPayout, stripe IDs, status
- `OtpCode` — email, codeHash, expiresAt, consumed

### Auth flow

- `POST /auth/send-otp` — send 6-digit OTP, store hashed code
- `POST /auth/verify-otp` — verify OTP, create user if needed, return JWT
- Use `JwtAuthenticationFilter` to validate JWT and populate `SecurityContext`
- Enforce role access with `@PreAuthorize(...)`

### Key REST endpoints

Public / client:

- `GET /api/availability?from=&to=`
- `POST /api/orders`
- `GET /api/orders/mine`
- `GET /api/orders/{id}/messages`
- `POST /api/orders/{id}/messages`

Editor:

- `GET /api/editor/assignments`
- `POST /api/editor/assignments/{id}/deliver`
- `GET /api/editor/earnings`

Admin:

- `GET /api/admin/orders`
- `POST /api/admin/orders/{id}/assign`
- `GET /api/admin/editors`
- `POST /api/admin/editors`
- `POST /api/admin/payments/{orderId}/release`
- `GET /api/admin/analytics`

### Availability engine

Only return open slots counts, not editor identities.

### Payment flow

- Stripe Connect Express onboarding for editors
- Client pays via PaymentIntent
- Funds held until delivery approval
- Transfer payout to editor connected account

---

## Frontend: React

### Structure

```
src/
├── api/
├── auth/
├── pages/
│   ├── client/
│   ├── editor/
│   └── admin/
├── components/
└── App.jsx
```

### Suggested libraries

- React Router
- Axios / React Query
- React Hook Form

### Auth flow

- `AuthContext` calls `/auth/send-otp` and `/auth/verify-otp`
- Prefer httpOnly cookie for the JWT
- `ProtectedRoute` is UX gating only; backend enforces authorization

---

## Build order

1. Spring Boot entities, repositories, Postgres
2. OTP auth backend end-to-end
3. React `AuthContext` wiring to OTP endpoints
4. Availability endpoint + calendar component
5. Order creation + tracking
6. Admin assignment + masked messaging
7. Stripe Connect integration
