# GambiaInfluence + OurInfluencers

## Overview

This monorepo hosts two separate influencer marketing platforms:

1. **GambiaInfluence** (`artifacts/gambia-influence`) — a public-facing platform for connecting Gambian businesses with local content creators.
2. **Influenza** (`artifacts/our-influencers`) — a premium enterprise influencer marketing hub where the operator is the primary admin. Admin-managed accounts, full campaign lifecycle tracking, and anonymous quick-promotion requests.

Both share the same API server (`artifacts/api-server`) and DB libraries.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (Tailwind CSS, shadcn/ui, wouter)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

- **GambiaInfluence** (`artifacts/gambia-influence`) — React + Vite frontend, preview path: `/`
- **OurInfluencers** (`artifacts/our-influencers`) — React + Vite frontend, preview path: `/our-influencers`
- **API Server** (`artifacts/api-server`) — Express 5 backend, preview path: `/api`

---

## OurInfluencers Platform

### Default Credentials

| Role  | Email                        | Password     |
|-------|------------------------------|--------------|
| Admin | admin@ourinfluencers.com     | Admin@2024!  |
| Client| client@acme.com              | Admin@2024!  |

### Frontend Pages (`/our-influencers`)

- `/` — Public homepage (influencer directory, niche filters, stats bar, quick promo form)
- `/login` — Login (email + password)
- `/influencers/:id` — Individual influencer profile with inline quick promo form
- `/dashboard` — Client view: all their campaigns with live status (auto-refreshes every 30s)
- `/admin` — Admin overview (stats summary + recent campaigns)
- `/admin/campaigns` — Full campaign management (create, edit status/postUrl, delete)
- `/admin/influencers` — Influencer directory management (add, edit, delete)
- `/admin/users` — Client account management (create, edit, delete, set password)
- `/admin/inquiries` — Incoming quick promo requests with status workflow

### Auth

Token format: `base64(userId:role).hmacSha256(SESSION_SECRET)`. Stored in localStorage under `oi_auth` key as `{ token, user }`. Admin routes guarded by `requireOiAdmin`, client routes by `requireOiAuth`.

### Database Tables (OurInfluencers-specific)

- `oi_users` — email, passwordHash (bcrypt), fullName, role (admin|client), companyName, phone
- `oi_campaigns` — title, description, budget, status (pending/active/posted/completed/cancelled), postUrl, postedAt, clientId, influencerId
- `oi_quick_promotions` — anonymous submissions with influencerId, contactName/Email/Phone, description, promoType, status (new/contacted/in_progress/done)

### API Routes (prefixed `/api/oi/`)

- `POST /oi/auth/login` — returns token + user
- `GET /oi/auth/me` — returns current user (requires Bearer token)
- `GET/POST /oi/users` — list + create users (admin only)
- `PATCH/DELETE /oi/users/:id` — update + delete user (admin only)
- `GET /oi/campaigns` — list campaigns (admin: all; client: own only)
- `POST /oi/campaigns` — create campaign (admin only)
- `GET /oi/campaigns/stats/summary` — summary counts + total budget
- `GET/PATCH/DELETE /oi/campaigns/:id` — campaign CRUD (admin)
- `GET /oi/quick-promotions` — list inquiries (admin only)
- `POST /oi/quick-promotions` — submit (no auth required)
- `PATCH /oi/quick-promotions/:id` — update status (admin only)

---

## GambiaInfluence Platform

### Frontend Pages (`/`)

- `/` — Home/Landing page with platform stats, top influencers, featured businesses
- `/influencers` — Browse all influencers with search/filter by location and niche
- `/influencers/:id` — Influencer profile with WhatsApp contact button and social links
- `/register/influencer` — Registration form for influencers
- `/register/business` — Registration form for businesses
- `/admin` — Admin dashboard (bcrypt auth, username/password)

### Database Schema

- `influencers` — name, location, niche, followersCount, social links, phone/WhatsApp, bio, profileImageUrl
- `businesses` — businessName, businessType, contactEmail, contactPhone, location, description, website
- `admin_users` — username, passwordHash (bcrypt), createdAt

---

## Shared Libraries

- `lib/api-spec` — OpenAPI spec source of truth
- `lib/api-client-react` — Generated React Query hooks (from Orval)
- `lib/api-zod` — Generated Zod validation schemas (from Orval)
- `lib/db` — Drizzle ORM client and schema

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
