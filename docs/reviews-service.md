# Reviews service: what is built (Phases 0-3, tested against a fake Google)

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
  `PUT|DELETE /api/v1/tenants/{ref}/locations/{googleLocationId}`, `GET /api/v1/healthz`, `GET /api/v1/readyz` (deep check).
- Phase 2 (migration `0002_reviews.sql`): review sync with a per-connection lease and early stop, `GET .../reviews` (cursor), `GET .../summary`,
  `POST .../sync`, cron `GET /api/v1/internal/cron/sync` (every 15 min) and `/purge` (daily), both requiring `CRON_SECRET`.
- Phase 3: `POST .../reviews/{id}/reply-drafts` (default: built-in reply library of about 2,300 pre-written combinations; positive reviews get a topic line only when they praise it and carry no negative wording, all others get neutral wording that concedes nothing, no review text leaves our systems; opt-in Gemini needs `DRAFTS_MODE=ai`, `GEMINI_API_KEY` and `AI_DRAFTS_POLICY_ACK=policy-updated`; every draft passes a deterministic safety check, with a generic template as fallback),
  `POST .../reviews/{id}/reply` (needs `approvedBy` and an `Idempotency-Key`; one live reply per review; `replace: true` to overwrite an existing reply).
- Rights requests: `GET .../export` (no secrets) and `DELETE /api/v1/tenants/{ref}?confirm={ref}` (revokes at Google, deletes everything including audit rows naming the tenant, reports `googleRevoked`).
- Retention: reviews purged 30 days after disconnect; audit rows older than 12 months removed.

## Not built yet / known gaps
- **Nothing here has run against real Google.** The reviews and reply calls (v4 API) wait on Business Profile API approval.
- Detection of reviews deleted on Google (`deleted_at` exists but is never set). Deletions are not propagated yet.
- Push notifications and outbound webhooks, Cloud KMS wrapper (interim `EnvKeyWrapper`), backups and restore drill.
- AI drafting is off by default. To enable it, set `DRAFTS_MODE=ai`, `AI_DRAFTS_POLICY_ACK=policy-updated` and `GEMINI_API_KEY` (billing on, paid tier) and update the privacy and terms pages first: they currently say review text is not sent to an AI provider. Confirm `GEMINI_MODEL` (default `gemini-2.5-flash-lite`) exists on your account.
- Library matching is by topic keywords only (staff, cleanliness, waiting time, value, place, expertise). Per-clinic custom reply lines and keyword rules are not built yet.
- The safety check is a deterministic filter (Latin-script only, blocks patient/health wording, links, contact details, reviewer names). It reduces risk; a human still approves every reply.

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
