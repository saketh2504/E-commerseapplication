# ATELIER 44 — PRD

## Original Problem Statement
Build a responsive full-stack e-commerce web application with:
- **Frontend (React.js)**: Product browsing with dynamic filtering, search bar, product detail pages, shopping cart, and checkout interface — fully responsive across mobile and desktop.
- **Backend**: Secure user authentication with session/token handling, server-side input validation for all forms, and RESTful APIs for auth, products, cart, and orders.
- **Database**: Schema for Users, Products, Cart, and Orders with proper relationships.
- Push the final codebase to GitHub with a README covering setup instructions and env variables.

## User Choices
- Niche: **Multi-category fashion**
- Auth: **JWT-based custom** (email + password)
- Payments: **Mock checkout** (no real gateway)
- Content management: **Admin panel** for products

## User Personas
- **Shopper** — browses collection, filters/searches, adds to cart, checks out (mock payment), reviews order history.
- **Studio Admin** — manages product catalogue (CRUD), monitors orders.

## Core Requirements (static)
- React 19 SPA with routes: `/`, `/shop`, `/products/:id`, `/cart`, `/checkout`, `/login`, `/register`, `/account`, `/admin`.
- FastAPI backend, all endpoints prefixed with `/api`.
- MongoDB collections: `users`, `products`, `cart`, `orders`.
- JWT auth: bcrypt-hashed passwords, cookies (httpOnly) + Bearer fallback.
- Admin role gate on product mutations and `/orders/all`.
- Server-side Pydantic validation on all request bodies.

## What's been implemented (2026-02-11)
- **Backend** (`/app/backend/server.py`)
  - Auth: `POST /api/auth/register|login|logout`, `GET /api/auth/me`. JWT (HS256), bcrypt, httpOnly cookies + Bearer.
  - Products: full public read + admin CRUD, filtering (category, search, min/max price, size, color), sorting, categories endpoint.
  - Cart: get/add/update/remove/clear with server-side subtotal + shipping calculation ($200 free-shipping threshold).
  - Orders: `POST /api/orders` (mock payment; snapshots cart items, clears cart), user + admin listing.
  - Startup seeder: admin user + 12 sample fashion products; unique-email index.
- **Frontend**
  - Editorial-brutalism design system (Cabinet Grotesk + Manrope, stark B/W + accent red, 0-radius, hard borders, hard shadows).
  - Home page with asymmetric hero, category tiles, featured grid, studio manifesto band.
  - Shop page with sticky-sidebar filters (mobile drawer), sort, live search, product grid.
  - Product detail with gallery, size/color/qty select, add-to-cart, related items.
  - Cart drawer + full cart page, checkout page with shipping form + mock payment + order confirmation.
  - Register/Login pages, account page with order history.
  - Admin console: products table (CRUD via modal form) + orders list.
  - Global sonner toaster, react-fast-marquee announcement bar, responsive header + mobile menu.
- **Docs**: `README.md` (features, env, API reference, data model, GitHub push instructions), `/app/memory/test_credentials.md`.
- **Testing**: Backend smoke tests + full frontend Playwright suite (12/12 scenarios pass, iteration_3.json).

## Prioritized Backlog
- **P1** – Product image gallery: swap main image on hover; support multiple images per product in seeder.
- **P1** – Save-for-later / Wishlist.
- **P2** – Guest checkout (currently requires auth).
- **P2** – Product reviews & ratings.
- **P2** – Real Stripe test-mode integration behind an env flag.
- **P2** – Admin — bulk import products via CSV, edit orders / update status.
- **P3** – Newsletter subscribe (currently visual only).
- **P3** – Email order confirmations (SendGrid/Resend).

## Next Tasks
1. Push to GitHub using the "Save to GitHub" flow in Emergent.
2. Optional: expand seed data (additional images per product, more categories).
3. Optional: wire Stripe test-mode when ready.
