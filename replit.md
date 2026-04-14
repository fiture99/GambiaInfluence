# GambiaInfluence

## Overview

GambiaInfluence is a full-stack influencer marketing platform for The Gambia, connecting local businesses with local content creators. Built as a pnpm monorepo using TypeScript.

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
- **API Server** (`artifacts/api-server`) — Express 5 backend, preview path: `/api`

## Frontend Pages

- `/` — Home/Landing page with platform stats, top influencers, featured businesses
- `/influencers` — Browse all influencers with search/filter by location and niche
- `/influencers/:id` — Influencer profile with WhatsApp contact button and social links
- `/register/influencer` — Registration form for influencers
- `/register/business` — Registration form for businesses

## Database Schema

Tables:
- `influencers` — name, location, niche, followersCount, social links, phone/WhatsApp, bio, profileImageUrl
- `businesses` — businessName, businessType, contactEmail, contactPhone, location, description, website

## API Endpoints

- `GET /api/influencers` — list with filters (location, niche, search)
- `POST /api/influencers` — register influencer
- `GET /api/influencers/:id` — get by ID
- `PATCH /api/influencers/:id` — update
- `DELETE /api/influencers/:id` — delete
- `GET /api/influencers/top` — top influencers by follower count
- `GET /api/businesses` — list businesses
- `POST /api/businesses` — register business
- `GET /api/businesses/:id` — get by ID
- `PATCH /api/businesses/:id` — update
- `DELETE /api/businesses/:id` — delete
- `GET /api/stats/platform` — platform-wide statistics
- `GET /api/stats/niches` — influencer count by niche
- `GET /api/stats/locations` — influencer count by location

## Shared Libraries

- `lib/api-spec` — OpenAPI spec source of truth
- `lib/api-client-react` — Generated React Query hooks (from Orval)
- `lib/api-zod` — Generated Zod validation schemas (from Orval)
- `lib/db` — Drizzle ORM client and schema

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
