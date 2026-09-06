# Backend — Nuxt Auth API (PostgreSQL + JWT)

Full-stack Nuxt 4 app with signup/login, JWT stored in an HTTP-only cookie, PostgreSQL for users, and a protected dashboard.

---

## What was installed

### Core framework

| Package | Purpose |
|---------|---------|
| `nuxt` | Full-stack Vue framework (pages + Nitro API routes) |
| `vue` | UI library (used by Nuxt) |
| `vue-router` | Client routing (used by Nuxt) |

### Database

| Package | Purpose |
|---------|---------|
| `pg` | PostgreSQL client (`Pool` for queries) |
| `node-pg-migrate` | Schema migrations (`users` table) |
| `dotenv` | Loads `.env` for migration config (`DATABASE_URL`) |
| `@types/pg` | TypeScript types for `pg` |

### Auth & security

| Package | Purpose |
|---------|---------|
| `bcrypt` | Hash passwords on signup; compare on login |
| `@types/bcrypt` | TypeScript types for `bcrypt` |
| `jsonwebtoken` | Sign / verify JWT (`userId`, 7-day expiry) |
| `@types/jsonwebtoken` | TypeScript types for `jsonwebtoken` |

### Install commands used

```bash
npx nuxi@latest init .          # Nuxt project (or equivalent)
npm install pg bcrypt jsonwebtoken dotenv node-pg-migrate
npm install -D @types/pg @types/bcrypt @types/jsonwebtoken
```

### External requirement

- **PostgreSQL** running locally (or remote), with a database named e.g. `machine_test`

---

## Project structure

```
backend/
├── app/
│   ├── app.vue                 # Root layout (<NuxtPage />)
│   ├── composables/
│   │   └── useAuth.ts          # Shared auth state + fetchUser / logout
│   ├── middleware/
│   │   └── auth.ts             # Route guard for protected pages
│   └── pages/
│       ├── login.vue           # Login form → POST /api/login
│       ├── signup.vue          # Signup form → POST /api/signup
│       └── dashboard.vue       # Protected page (auth middleware)
├── server/
│   ├── api/
│   │   ├── signup.post.ts      # Register user
│   │   ├── login.post.ts       # Login + set auth_token cookie
│   │   ├── test-db.get.ts      # DB connectivity check
│   │   └── auth/
│   │       ├── me.get.ts       # Current user from JWT cookie
│   │       └── logout.post.ts  # Clear auth_token cookie
│   └── utils/
│       └── jwt.ts              # generateToken / verfiyToken
├── src/
│   └── config/
│       └── database.ts         # pg Pool from env vars
├── migrations/
│   └── *_create-user-table.js  # Creates users table
├── node-pg-migrate-config.mjs  # Migration DB URL + dir
├── nuxt.config.ts              # runtimeConfig.jwtSecret
└── .env                        # DB + JWT secrets (not committed)
```

---

## Environment variables

Create a `.env` in `backend/`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=machine_test
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/machine_test
JWT_SECRET=your_long_random_secret
```

- `DB_*` → used by `src/config/database.ts` (app queries)
- `DATABASE_URL` → used by `node-pg-migrate`
- `JWT_SECRET` → loaded into Nuxt `runtimeConfig.jwtSecret` via `nuxt.config.ts`

---

## Database setup

### 1. Create the database

```sql
CREATE DATABASE machine_test;
```

### 2. Run migrations

```bash
npm run migrate up
```

Creates the `users` table:

| Column | Type | Notes |
|--------|------|--------|
| `id` | serial | Primary key |
| `name` | varchar(100) | Required |
| `email` | varchar(100) | Required, unique |
| `password` | varchar(255) | bcrypt hash |
| `created_at` | timestamp | Default `CURRENT_TIMESTAMP` |
| `updated_at` | timestamp | Default `CURRENT_TIMESTAMP` |

Rollback:

```bash
npm run migrate down
```

---

## How to run

```bash
npm install
npm run migrate up
npm run dev
```

App: `http://localhost:3000`

Optional DB check: `GET http://localhost:3000/api/test-db`

---

## Application logic

### High-level auth flow

```
Signup  → hash password → insert user (no auto-login)
Login   → verify password → JWT → HTTP-only cookie `auth_token`
Visit protected page → auth middleware → GET /api/auth/me (cookie)
Logout  → delete cookie → clear client user → redirect /login
```

JWT is **not** returned in the JSON body for normal use; it lives in an **HTTP-only** cookie (`httpOnly`, `sameSite: 'lax'`, 7 days, path `/`). JavaScript cannot read it; the browser sends it automatically on same-origin API calls.

---

### 1. Signup (`POST /api/signup`)

1. Read `name`, `email`, `password` from body.
2. Reject if any field is missing (400).
3. Query `users` by email; reject if already registered (400).
4. `bcrypt.hash(password, 10)`.
5. `INSERT INTO users (name, email, password)`.
6. Return success message.

UI: `app/pages/signup.vue` posts to `/api/signup` and shows success/error.

---

### 2. Login (`POST /api/login`)

1. Read `email`, `password`.
2. Reject if missing (400).
3. Load user by email; fail if not found.
4. `bcrypt.compare(password, user.password)`; 401 if mismatch.
5. `generateToken(user.id)` → JWT with `{ userId }`, signed with `JWT_SECRET`, expires in `7d`.
6. `setCookie(event, 'auth_token', token, { httpOnly, sameSite: 'lax', maxAge: 7 days })`.
7. Return `{ success, message, user: { id, name, email } }` (no password).

UI: `app/pages/login.vue` posts to `/api/login`, then navigates to `/dashboard`.

---

### 3. Current user (`GET /api/auth/me`)

1. Read cookie `auth_token`.
2. If missing → 401.
3. `verfiyToken(token)` → `{ userId }`.
4. `SELECT id, name, email FROM users WHERE id = $1`.
5. If no row or invalid/expired JWT → 401.
6. Return `{ success, user }`.

Used by `useAuth().fetchUser()` (with `useRequestFetch()` so cookies work during SSR).

---

### 4. Logout (`POST /api/auth/logout`)

1. `deleteCookie` for `auth_token`.
2. Return success.

`useAuth().logout()` calls this, sets `user` to `null`, then `navigateTo('/login')`.

---

### 5. Route protection (`app/middleware/auth.ts`)

Applied on `dashboard.vue` via:

```ts
definePageMeta({ middleware: 'auth' })
```

Logic:

1. If `user` is not already in state → call `fetchUser()` (`/api/auth/me`).
2. If still no user → redirect to `/login`.
3. Otherwise allow the page.

---

### 6. Client auth state (`useAuth` composable)

- `user` / `loading` stored in Nuxt `useState` (shared across SSR + client).
- `fetchUser()` → `/api/auth/me`.
- `logout()` → `/api/auth/logout` + clear state + redirect.

---

### 7. JWT helpers (`server/utils/jwt.ts`)

- `generateToken(userId)` — signs `{ userId }` with `runtimeConfig.jwtSecret`.
- `verfiyToken(token)` — verifies signature and expiry.

---

### 8. Database pool (`src/config/database.ts`)

Single `pg.Pool` using `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`. Shared by signup, login, me, and test-db handlers.

---

## API summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/signup` | No | Create user |
| `POST` | `/api/login` | No | Login; set JWT cookie |
| `GET` | `/api/auth/me` | Cookie | Current user |
| `POST` | `/api/auth/logout` | Cookie | Clear JWT cookie |
| `GET` | `/api/test-db` | No | PostgreSQL connectivity test |

---

## Pages

| Route | Access | Behavior |
|-------|--------|----------|
| `/signup` | Public | Register account |
| `/login` | Public | Sign in → `/dashboard` |
| `/dashboard` | Protected | Shows name/email/id; logout button |

---

## npm scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `nuxt dev` | Local development |
| `build` | `nuxt build` | Production build |
| `preview` | `nuxt preview` | Preview production build |
| `generate` | `nuxt generate` | Static generation |
| `migrate` | `node-pg-migrate` | Run DB migrations |
| `postinstall` | `nuxt prepare` | Generate Nuxt types after install |

---

## Security notes (as implemented)

- Passwords stored only as **bcrypt** hashes (salt rounds: 10).
- JWT kept in **HTTP-only** cookie (not readable by client JS).
- Cookie `sameSite: 'lax'` reduces CSRF risk on cross-site POSTs.
- Protected UI routes re-check the server via `/api/auth/me`.
- Keep `.env` out of git (already listed in `.gitignore`).
