# realyt-backend

Spring Boot backend for Realyt.

## Goals

- JWT-based auth using email OTP
- Role-based API access (`CLIENT`, `EDITOR`, `ADMIN`)
- PostgreSQL persistence with Spring Data JPA
- Stripe Connect payment / escrow support
- Availability engine for calendar slots

## Suggested first tasks

1. Create entity model: `User`, `Order`, `Assignment`, `Message`, `Payment`, `OtpCode`
2. Configure PostgreSQL connection
3. Implement `/auth/send-otp` and `/auth/verify-otp`
4. Add JWT filter and Spring Security config
5. Build protected sample endpoint for verification
