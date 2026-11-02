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
- Connect result status values returned on the return URL: `connected`, `no_business_profile` (the Google account manages no profile), `denied`, `insufficient_permission`, `error`.
- Going live with other clinics: see [oauth-verification-pack.md](./oauth-verification-pack.md) and the clinic guide [clinic-onboarding.md](./clinic-onboarding.md).
- **Deletion hard rule (two confirmations).** Nothing destructive happens on one call. `DELETE` on a tenant, a connection or a location link is refused (400
  `DELETION_REQUIRES_TWO_CONFIRMATIONS`). Instead: `POST /api/v1/tenants/{ref}/deletion-requests` with `{"action":"erase_tenant"|"disconnect"|"unlink_location","locationId":...}`
  returns what will be deleted, the exact phrase (for example `ERASE clinic-1`) and one-time secret #1; `POST .../deletion-requests/{id}/confirm` with `{"step":1,"token","phrase"}`
  returns secret #2; the same call with `{"step":2,...}` executes. 10-minute expiry, each secret works once, a wrong phrase or secret counts as an attempt and five cancel the request.
  Any future way to delete (for example removing a posted reply) must use this same mechanism. Automatic retention purges are policy, not user deletions.
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

## Dashboard (reviews.tysonlabs.in)
Per-business logins. "Sign in with Google" (openid + email only, PKCE, signed state cookie, verified email required) proves who the person is; access to a business comes only from
the `tenant_members` table (migration 0005), read from the database on every request. Roles: **owner** may connect Google; **staff** may read, sync and post approved replies. TysonLabs
admins (`DASHBOARD_ADMIN_EMAILS`) may open every business of `DASHBOARD_CLIENT_ID` and use the Businesses page to add a business and its first members. The approver recorded on a
posted reply is the signed-in email. Pages: Overview, Reviews, Google connection, Businesses (admin). No delete controls: deletion stays on the two-confirmation API.
Served by the same app: next.config.ts rewrites the dashboard host to `/dashboard/*`; the layout refuses any other host. `DASHBOARD_HOST` must be set the same at build and run time.
Env: `DASHBOARD_SESSION_SECRET`, `DASHBOARD_CLIENT_ID`, `DASHBOARD_ADMIN_EMAILS`, `DASHBOARD_BASE_URL`, `DASHBOARD_HOST`, `GOOGLE_SIGNIN_REDIRECT_URI`
(the callback URL must also be an authorised redirect URI on the Google OAuth client). Revoking a member is done in SQL and the two-confirmation rule applies to it.

## Console (demo UI)
`/console` is a small web console for one client (`CONSOLE_CLIENT_ID`), behind one shared password (`CONSOLE_PASSWORD`, at least 12 characters) and a signed
httpOnly cookie (`CONSOLE_SESSION_SECRET`, 8 hours, stateless: changing the secret signs everyone out). It lists connected businesses, shows reviews, runs a sync,
suggests a reply, and posts it after an explicit "I approve" tick plus the approver's name. It has no delete controls, and reply text never appears in a URL.
It is a demo gate, not a user system: real per-clinic logins are a later build.

## Deploying
`vercel --prod --yes --scope kbdcreditsolutions-projects` from this folder. Vercel blocks a deployment whose commit author is not a member of the Vercel team
("the commit author doesn't have permission to create deployments"), so this repo's git identity is `KBD Credit Solutions <kbdcreditsolutions@gmail.com>`
(`git config user.email`). Use the current Vercel CLI (`npx vercel@latest`): old versions show a blocked deployment as UNKNOWN.

## Backups (local, encrypted, verified)
- `scripts/backup-reviews-db.sh` takes a read-only consistent snapshot of every table, encrypts it (AES-256, passphrase `BACKUP_PASSPHRASE` kept in `~/.tysonlabs-reviews/credentials.env`; copy it to your password manager), verifies the archive row counts, warns if a table drops by more than half since the last backup, and keeps the newest 30. Output: `~/.tysonlabs-reviews/backups/`.
- `scripts/restore-drill.sh` restores the newest backup into a throwaway local PostgreSQL and compares every table's row count plus a row-level-security check. Run it monthly and after any schema change. A backup that has never been restored does not count.
- Schedule: `scripts/in.tysonlabs.reviews-backup.plist` runs the backup daily at 02:30 (install steps below). The Mac must be on; a missed run happens when it wakes.
- Backups hold review text, so keep FileVault on and copy the folder to a second place (external disk or a private cloud folder). The file is encrypted, which protects copies, but the passphrase and the database owner URL live in the same credentials file.
- Monthly restore drill: `scripts/monthly-restore-drill.sh` runs the drill and appends PASSED or FAILED to `~/.tysonlabs-reviews/backups/restore-drill.log`; schedule file `scripts/in.tysonlabs.reviews-restore-drill.plist` (1st of each month, 03:30). Install it like the backup schedule.
- Install the schedule: `cp scripts/in.tysonlabs.reviews-backup.plist ~/Library/LaunchAgents/ && launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/in.tysonlabs.reviews-backup.plist`.

## Notes from the security review (differences from the design doc)
- API keys are stored as HMAC-SHA256 with `API_KEY_PEPPER`, not plain SHA-256. Never change the pepper: it invalidates every key.
- OAuth state is an opaque, DB-backed, single-use value (functionally equivalent to a signed, audience-bound state); it is not bound to a browser cookie because the client app authorised the tenant server-side.
- The client IP for allowlists comes from `x-vercel-forwarded-for` / `x-real-ip` only; with no trusted IP the request is refused. Allowlists are exact-match (no CIDR yet).
- Rate limits are database-backed fixed windows: 300/min per IP on authentication, 600/min per client, 60/min per IP on the public connect and callback routes; 1000 tenants per client by default (`clients.max_tenants`).
- The one-time connect secret sits in the URL path. Do not log that path; link-preview bots that GET it consume the link. A click-through page is a later hardening step.
- A location-link refusal (409) reveals that a location the caller can see is linked elsewhere, never by whom.
- Token ciphertexts are bound to `(clientId, tenantId)` with AES-GCM AAD. The interim env-variable KEK must be replaced by Cloud KMS before launch.
- Phase 2 sync must re-verify link ownership at write time and filter reviews by tenant, never by link id alone.
