# Reviews service: what is built (Phase 0/1)

Implements phases 0-1 of [reviews-service-design.md](./reviews-service-design.md) inside this repo
(`src/reviews-service`, `src/app/api/v1`, `db/`). Decisions applied: lives in the TysonLabs central repo;
polling only (no outbound webhooks) in v1; 30-day review purge and 12-month audit retention (confirm with counsel);
plain `pg` with SQL migrations instead of Prisma so row-level security is explicit and testable.

## Built
- Clients, API keys (HMAC-hashed, scoped, revocable, optional IP allowlist), tenants, connections, location links, audit log.
- Row-level security on every table with FORCE; the app connects as a non-owner role without BYPASSRLS. No scope set = no rows.
- Connect sessions: one-time link, 10-minute expiry, pre-registered return URLs, PKCE, single-use state, status-code-only redirect.
- Refresh tokens envelope-encrypted (per-connection data key wrapped by a key-wrapper).
- Endpoints: `POST /api/v1/connect-sessions`, `GET /api/v1/connect/{token}`, `GET /api/v1/oauth/callback`,
  `GET|DELETE /api/v1/tenants/{ref}/connection`, `GET /api/v1/tenants/{ref}/available-locations`,
  `PUT|DELETE /api/v1/tenants/{ref}/locations/{googleLocationId}`, `GET /api/v1/healthz`.

## Not built yet
Review sync and cron, reviews/summary API, reply drafts and posting, push notifications, tenant export/erasure endpoints,
purge job for `purge_reviews_after`, Cloud KMS wrapper (interim `EnvKeyWrapper` in use), rate limiting, backups and restore drill.

## Setup (new database only)
1. Create a NEW Neon project (PITR on, paid retention). Never point this at another app's database.
2. Run the guarded setup script. It aborts unless the target is empty, creates both roles with generated passwords, applies the migration and checks the app role cannot bypass RLS. Passwords are printed once to your terminal, never saved:
   `ADMIN_DATABASE_URL='<neon owner connection string>' scripts/setup-reviews-db.sh --yes`
   (`db/roles.sql` is the manual equivalent.) Neon Free keeps only 6 hours of history: use it for setup and testing only, and move to a paid plan plus a scheduled external backup before any real client data.
3. Set env vars from `.env.example` in Vercel; `REVIEWS_DATABASE_URL` uses `reviews_app`.
4. Provision a client with an API key (owner role): insert into `clients` (with `allowed_return_urls`) and `api_keys`
   using `generateApiKey()` from `src/reviews-service/apikeys.ts`; the key is shown once.

## Tests
`npm test` starts a throwaway local Postgres 17 (needs `/opt/homebrew/opt/postgresql@17`, or set `PG_BIN`), applies the migration,
and runs isolation tests. It never touches a real database.

## Notes from the security review (differences from the design doc)
- API keys are stored as HMAC-SHA256 with `API_KEY_PEPPER`, not plain SHA-256. Never change the pepper: it invalidates every key.
- OAuth state is an opaque, DB-backed, single-use value (functionally equivalent to a signed, audience-bound state); it is not bound to a browser cookie because the client app authorised the tenant server-side.
- The client IP for allowlists comes from `x-vercel-forwarded-for` / `x-real-ip` only; with no trusted IP the request is refused. Allowlists are exact-match (no CIDR yet).
- Rate limits are database-backed fixed windows: 300/min per IP on authentication, 600/min per client, 60/min per IP on the public connect and callback routes; 1000 tenants per client by default (`clients.max_tenants`).
- The one-time connect secret sits in the URL path. Do not log that path; link-preview bots that GET it consume the link. A click-through page is a later hardening step.
- A location-link refusal (409) reveals that a location the caller can see is linked elsewhere, never by whom.
- Token ciphertexts are bound to `(clientId, tenantId)` with AES-GCM AAD. The interim env-variable KEK must be replaced by Cloud KMS before launch.
- Phase 2 sync must re-verify link ownership at write time and filter reviews by tenant, never by link id alone.
