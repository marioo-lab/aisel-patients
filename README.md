# Aisel Patients

A small, production-shaped patient-management app: role-aware auth, a searchable/sortable/paginated patients directory, and create/edit/delete with optimistic updates — built on Next.js + TypeScript + Prisma (PostgreSQL), styled with Tailwind + shadcn/ui.

## Stack

- **Next.js 15** (App Router) + **TypeScript** (strict)
- **Prisma 6** + **PostgreSQL** (Neon)
- **Auth:** `jose` (JWT, HS256) in an httpOnly cookie + `bcryptjs`
- **Data fetching:** SWR (optimistic mutations)
- **Forms/validation:** react-hook-form + zod (shared client/server schema)
- **Table:** TanStack Table (shadcn data-table pattern), server-driven
- **UI:** Tailwind CSS v4 + shadcn/ui
- **Tests:** Vitest

## Quick start

You need Node 20+ and a PostgreSQL database. The project is configured for **Neon**.

```bash
# 1. install
npm install

# 2. configure env — copy and fill it in
cp .env.example .env
#   DATABASE_URL → your Neon connection string (?sslmode=require)
#   AUTH_SECRET  → openssl rand -hex 32

# 3. create the schema (no migrations — Prisma db push) and seed
npm run db:push
npm run db:seed

# 4. run
npm run dev
```

Open http://localhost:3000 → you'll be redirected to `/login`.

> Schema changes are applied with `prisma db push` (no migration history).

### Demo accounts (seeded)

| Role   | Email                | Password    | Can                       |
| ------ | -------------------- | ----------- | ------------------------- |
| Admin  | `admin@aisel.health` | `aisel1234` | view + create/edit/delete |
| Member | `user@aisel.health`  | `aisel1234` | view only                 |

Both are prefilled by the buttons on the login screen.

## Scripts

| Script                          | Description                                       |
| ------------------------------- | ------------------------------------------------- |
| `dev` / `build`                 | Next dev / production build                       |
| `db:push`                       | Push the Prisma schema to the DB (no migrations)  |
| `db:seed`                       | Seed 2 users + 52 patients                        |
| `db:setup`                      | `db:push` then `db:seed`                           |
| `db:reset`                      | Force-reset the schema and reseed                 |
| `test`                          | Run the Vitest suite                              |
| `lint` / `typecheck` / `format` | ESLint / `tsc --noEmit` / Prettier                |

## Architecture

```
src/
  app/
    (auth)/login         public login route
    (app)/patients       protected list (server component reads the session, passes user down)
    api/auth/*           login (sets cookie) / logout (clears it)
    api/patients[/[id]]  REST CRUD
  server/                backend (node runtime)
    auth/ patients/      services — business rules, call Prisma directly
    lib/                 prisma · auth (jose) · session · errors · logger
  lib/
    validations/         shared zod schemas + DTO types (client + server)
    api-client · api-error · patient-display
  hooks/use-patients     SWR list + optimistic create/update/remove
  components/
    ui/                  shadcn primitives
    patients/            data-table, columns, form/view sheets, delete dialog, row actions
    layout/ auth/        topbar, login form
  middleware.ts          edge: verify cookie, gate routes
```

- **Auth flow:** `POST /auth/login` verifies bcrypt + signs a JWT into an httpOnly cookie. `middleware.ts` verifies it (edge) to gate navigation; API routes re-check it for RBAC (defense in depth). The UI learns its identity from the server, never by decoding a token in JS.
- **RBAC:** Admin = full CRUD; Member = read-only. Enforced in route handlers via `requireUser` / `requireRole`, returning `401` / `403`.
- **Errors:** one envelope `{ error: { code, message, fieldErrors? } }`; services throw typed errors mapped centrally to status codes (`400/401/403/404/409/500`). A duplicate email yields `409` with a field error the form maps onto the email input.
- **Optimistic UX:** create/edit/delete update the SWR cache immediately and roll back on a real error; the list shows skeleton / empty / error states from the genuine fetch lifecycle.

## API

| Method   | Path            | Role         | Response                       |
| -------- | --------------- | ------------ | ------------------------------ |
| `POST`   | `/auth/login`   | any          | `{ user }` (+ cookie)          |
| `POST`   | `/auth/logout`  | any          | `{ ok: true }`                 |
| `GET`    | `/patients`     | admin / user | `{ data, page, limit, total }` |
| `GET`    | `/patients/:id` | admin / user | `Patient`                      |
| `POST`   | `/patients`     | admin        | `Patient` (201)                |
| `PUT`    | `/patients/:id` | admin        | `Patient`                      |
| `DELETE` | `/patients/:id` | admin        | `{ ok: true }`                 |

List query: `?page&limit&q&sort&order` — `q` is a case-insensitive search across name/email/phone; `sort ∈ {lastName,email,dob,createdAt}`; default `createdAt desc`.

## Tests

```bash
npm test
```

Service unit tests and API handler tests run against a **mocked Prisma client** (no database needed) — covering RBAC (`401`/`403`), validation (`400`), not-found (`404`), and the duplicate-email conflict (`409`).

## Design decisions

Domain language lives in [`CONTEXT.md`](./CONTEXT.md); non-obvious calls are recorded as ADRs in [`docs/adr/`](./docs/adr):

- [0001](./docs/adr/0001-auth-token-in-httponly-cookie.md) — auth token in an httpOnly cookie (login returns `{ user }`, token via `Set-Cookie`)
- [0002](./docs/adr/0002-no-patient-status-field.md) — no Patient `status` field (API contract honored verbatim)
- [0003](./docs/adr/0003-two-layer-backend-no-repository.md) — two-layer backend, services call Prisma directly
