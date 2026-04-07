# Platr — Order Management System

> Enterprise-grade restaurant order management platform — API + Next.js client (full-stack).

Platr (Project 9) is a complete order management solution built to streamline restaurant operations: accepting orders, routing them to kitchen staff, providing waiters with a fast order UI, and supplying management with a dashboard for analytics and menu management. This repo contains two main workspaces:

- `api/` — backend REST API built with Node.js and Express. Uses Prisma + MySQL for persistence and includes real-time notifications via sockets.
- `client/` — frontend implemented with Next.js (TypeScript). Provides role-aware interfaces for Admin, Kitchen, Waiter and Dashboard views.

This README is intended to be an authoritative reference for development, deployment, operations and contribution.

## Table of contents

- [Quick summary](#quick-summary)
- [Architecture & file layout](#architecture--file-layout)
- [Core concepts & data shapes](#core-concepts--data-shapes)
- [Key features](#key-features)
- [UI overview & illustrations](#ui-overview--illustrations)
- [Tech stack & dependencies](#tech-stack--dependencies)
- [Local development](#local-development)
- [Database & migrations](#database--migrations)
- [API reference & routes](#api-reference--routes)
- [Real-time & sockets](#real-time--sockets)
- [Security & best practices](#security--best-practices)
- [Deployment & CI/CD recommendations](#deployment--cicd-recommendations)
- [Testing, observability & maintenance](#testing-observability--maintenance)
- [Contributing & governance](#contributing--governance)
- [Appendices](#appendices)

## Quick summary

- Repo root contains `api/` and `client/` workspaces. Both are runnable independently for development.
- Backend uses Prisma (see `api/prisma/`) and ships migrations + a seed script.
- Frontend is a Next.js app in `client/` with pages for `admin`, `dashboard`, `kitchen`, `waiter`, and `login`.

## Architecture & file layout

Top-level layout (important files/folders):

- `/api`
  - `package.json` — backend scripts and deps
  - `src/app.js` — Express app factory and middleware wiring
  - `src/server.js` — server bootstrap
  - `src/config/env.js` — environment variables loader
  - `src/controllers/*` — request handlers (auth, orders, menu items, tables, users)
  - `src/routes/*` — route definitions
  - `src/middlewares/*` — auth and role middlewares
  - `src/utils/prisma.js` — Prisma client wrapper
  - `prisma/` — Prisma schema, migrations and seed

- `/client`
  - Next.js TypeScript app (app directory)
  - `app/` pages: `admin`, `dashboard`, `kitchen`, `waiter`, `login`
  - `components/` — UI components (Navbar, OrderCard, ProtectedRoute, Dashboard widgets)
  - `lib/api.ts` — client-side API helpers
  - `lib/socket.ts` — client socket connection

## Core concepts & data shapes

This section gives the canonical data shapes used across the app. These are simplified; check `api/prisma/schema.prisma` for the authoritative model.

- Order
  - id: string | number
  - items: [{ menuItemId, quantity, price }]
  - tableId: number | null
  - status: enum (PENDING, IN_PROGRESS, READY, SERVED, CANCELLED)
  - total: number
  - createdAt, updatedAt

- MenuItem
  - id, name, description, price, category, imageUrl, isAvailable

- User
  - id, name, email, passwordHash, role (ADMIN, KITCHEN, WAITER)

- Table
  - id, name/number, seats, status (FREE, OCCUPIED)

Error model:
- Standard JSON response: { success: boolean, data?: any, error?: { code, message, details? } }

## Key features

- Order lifecycle management (create, update status, cancel)
- Menu management (CRUD for menu items and categories)
- Role-based access control: Admin, Kitchen, Waiter
- Real-time updates (order status changes and new orders) via sockets
- Authentication using JWT
- Prisma migrations and seed for reproducible database setup

## UI overview & illustrations

The client provides the following role-aware pages. The descriptions below include simple ASCII wireframes to illustrate layout and primary components.



  ![Login screen](docs/images/login.png)

  A focused sign-in screen used by staff to access role-aware interfaces.

- Dashboard (Admin)

  ![Admin dashboard](docs/images/dashboard.svg)

  Management dashboard showing KPIs, recent orders, and quick actions for menu and table management.

- Kitchen view

  ![Kitchen view](docs/images/kitchen.svg)

  Kitchen view lists incoming orders with quick status controls (Start, Ready) and item summaries.

- Waiter view

  ![Waiter view](docs/images/waiter.svg)

  Waiter interface for table management and quick order creation.

These illustrations are guidance; see `client/app/*` pages and `components/` for actual components and their props.

## Tech stack & dependencies

- Backend
  - Node.js (ESM)
  - Express
  - Prisma ORM + MySQL
  - jsonwebtoken (JWT)
  - nodemon (dev)

- Frontend
  - Next.js (app router, TypeScript)
  - React
  - Tailwind / custom CSS (check `client/globals.css`)

## Local development

Prerequisites:

- Node.js 18+ (recommended)
- MySQL 8+ or compatible (or use Docker)

Backend (api):

```bash
# from repo root
cd api
npm install

# copy/prepare env (example variables below)
# run database migrations and seed using Prisma
npm run prisma:migrate   # or: npx prisma migrate deploy / npx prisma migrate dev
node prisma/seed.js      # seed data (if desired)

# development server
npm run dev
```

Frontend (client):

```bash
cd client
npm install
npm run dev
# open http://localhost:3000 (or the port shown)
```

Ports:
- API default: PORT (see `api/src/config/env.js`) — commonly 4000 or 5000
- Client default: Next.js dev (3000)

## Environment variables (suggested)

Create `.env` files in `api/` and `client/` as appropriate. Example values below should be adapted to your environment.

API (`api/.env`)

```
PORT=4000
DATABASE_URL="mysql://user:password@localhost:3306/platr_db"
JWT_SECRET=super_secret_jwt_key
NODE_ENV=development
```

Client (`client/.env.local`)

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

## Database & migrations

This project uses Prisma. Migrations are stored in `api/prisma/migrations/` and there is a seed script at `api/prisma/seed.js`.

Typical migration commands (dev):

```bash
cd api
npx prisma migrate dev --name init
npx prisma db seed
```

To deploy migrations on production:

```bash
npx prisma migrate deploy
```

Backups & zero-downtime notes:

- Use logical backups (mysqldump) or physical snapshots depending on hosting.
- For adding non-nullable columns, follow phased rollout: add nullable column, backfill, then set NOT NULL.

## API reference & routes

The backend exposes REST endpoints organized under `src/routes/`.

High-level endpoints (examples):

- Auth
  - POST /api/auth/login — returns JWT
  - POST /api/auth/register — creates user

- Users
  - GET /api/users — admin only
  - GET /api/users/:id

- Menu items
  - GET /api/menu-items
  - POST /api/menu-items — admin
  - PUT /api/menu-items/:id — admin

- Orders
  - POST /api/orders — create new order
  - GET /api/orders — list (filter by status/table)
  - PATCH /api/orders/:id/status — update status (kitchen actions)

- Tables
  - GET /api/tables
  - POST /api/tables

Authentication: JWT in Authorization header: `Authorization: Bearer <token>`

Response format:

```json
{
  "success": true,
  "data": { ... }
}
```

Errors use the `{ success: false, error: { code, message } }` shape.

For exact route names and payload shapes, inspect `api/src/routes` and `api/src/controllers`.

## Real-time & sockets

The backend exposes socket integration (see `api/src/utils/socket.js`) to broadcast order events. The client connects using `lib/socket.ts`. Real-time flows include:

- New order created -> broadcast to Kitchen and Dashboard
- Order status changed -> broadcast to Waiter and Dashboard

Use authenticated socket connections (send JWT during socket handshake or use token exchange endpoint).

## Security & best practices

- Keep `JWT_SECRET` and DB credentials out of source control. Use secrets manager in production.
- Use HTTPS and secure cookies for production
- Validate and sanitize all inputs (use DTOs or validation middleware)
- Rate-limit authentication endpoints
- Use role-based middleware (already present at `src/middlewares/roleMiddleware.js`)
- Rotate secrets and maintain an audit trail for privilege changes

## Deployment & CI/CD recommendations

Suggested production architecture:

- Backend: containerized Node.js app behind load balancer (use Dockerfile). Use auto-scaling groups or pods (Kubernetes).
- Database: managed MySQL (RDS, Cloud SQL) with automated backups and replicas for reads.
- Frontend: Next.js static export or server-side rendered deployment (Vercel, Netlify, or container).
- Real-time: run socket server alongside backend or use a websocket service.

Sample GitHub Actions workflow (high level):

1. On push to main: run lint, tests, run prisma migrate:deploy to a staging DB, build client, build and push Docker images.
2. Create tags/releases and deploy to production with environment-specific secrets.

## Testing, observability & maintenance

- Tests: add unit tests for controllers and integration tests for API routes (Jest + Supertest).
- Linting: add ESLint and Prettier for code consistency.
- Observability: structured logs (JSON), export metrics (Prometheus), set up alerts for error rate and latency.
- Error tracking: Sentry or similar for runtime exceptions.

## Contributing & governance

- Follow GitHub Flow: feature branches, PRs, code review.
- Include tests for new features and migrations.
- Document public APIs and update README when changing contracts.

## Appendix A — Example request/response

Create order (POST /api/orders)

Request:

```json
POST /api/orders
{
  "tableId": 5,
  "items": [ { "menuItemId": 3, "quantity": 2 }, { "menuItemId": 5, "quantity": 1 } ]
}
```

Response:

```json
{
  "success": true,
  "data": { "id": 123, "status": "PENDING", "total": 24.50 }
}
```

## Contributors

Group 9

1. Shimwa Aime Kelvin (Group Representative)
2. Umwizerwa Achille Rigobert
3. Imena Benjamin
4. Ice Perla
5. Ikaze Annick
6. Kanyana Belinda
7. Rumanzi Bright King
8. Mugabekazi Alice

