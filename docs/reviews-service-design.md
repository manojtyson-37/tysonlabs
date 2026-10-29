# TysonLabs Reviews Service — Design (v1 draft)

Status: draft for review, 2026-10-29. Nothing in this document is built yet.
Supersedes the in-app tables from Phase 1 of the SDPC branch `feat/google-reviews-multitenant`
(commits 92adfb1, 81a06d1), whose SQL was never applied to any database.

## 1. Goals and non-goals

**Goals**
- One service, owned by TysonLabs, that connects clinics' Google Business Profiles, syncs their reviews, and posts approved replies. Any client app (SDPC first) uses it through an API.
- Pass Google's verification once, on `tysonlabs.in`.
- Hold as little personal data as possible: reviews, locations, Google credentials. **Never patient or clinical data.**
- Isolation between clients and between a client's tenants that is enforced by the database, not only by application code.
- Backups, deletion and export that work from day one.

**Non-goals (v1)**
- Review gating or review solicitation (forbidden by Google's policy).
- Auto-posting replies without a human approving them.
- Per-client dedicated databases (designed for, not built).
- Other review sources (Facebook, Practo, etc.).

## 2. Architecture

```
Clinic admin browser ──► Client app (SDPC) ──server-to-server, API key──► Reviews service (reviews.tysonlabs.in)
        │                                                                     │      │        │
        └──── redirected for Google consent only ─────────────────────────────┘      │        └─► Google Business Profile APIs
                                                                                      ▼
                                                                              Neon Postgres (NEW project, own backups)
                                                                              Cloud KMS (token key wrapping)
```

- **Separate repository and deployment** (`tysonlabs-reviews`, proposed owner `manojtyson-37`, matching how the TysonLabs site repo is owned). Not part of the marketing site: different secrets, different blast radius, different deploy.
- **Stack:** Next.js (App Router) on Vercel, Prisma, Postgres on a **new** Neon project. This reuses Phase 1 code almost directly.
- **Hosts:** `reviews.tysonlabs.in` serves the API and the OAuth callback. `tysonlabs.in` is the consent-screen homepage (product page, privacy policy, terms).
- **Browsers never call the API.** Only client app servers do, with an API key. The one browser interaction is the Google consent redirect.

## 3. Trust model and authentication

**Client apps** (SDPC, future clients) authenticate with an API key:
- 256-bit random secret, prefix `rk_live_<keyId>_...`. Only a SHA-256 hash and the key ID are stored.
- Two keys can be active at once so rotation has no downtime. Keys have scopes, a last-used timestamp and can be revoked instantly.
- Optional per-client IP allowlist. Per-client rate limits.
- Sent as `Authorization: Bearer` over TLS only.

**Connect flow without trusting the browser**
1. SDPC's server calls `POST /v1/connect-sessions` with `{ tenantRef, returnUrl }` using its API key. The service checks `returnUrl` against that client's pre-registered allowlist (no open redirects).
2. The service returns a one-time URL (10-minute expiry, single use). SDPC redirects the admin's browser to it.
3. The service runs the OAuth code flow with PKCE and a signed, audience-bound state tied to `(clientId, tenantId, sessionId)`, then redirects back to the allowed `returnUrl` with a status code only (never tokens).

A user therefore cannot choose which tenant they connect: the client app, authenticated, decided that.

**Who approves a reply** is the client app's responsibility: it passes `approvedBy` (its own user reference) on every post, and the service records it in the audit log.

## 4. Data model

Every table carries `clientId` and, where applicable, `tenantId`. Naming below is logical.

| Table | Purpose | Key constraints |
|---|---|---|
| `Client` | A customer app (SDPC) | `status`, allowed return URLs, optional IP allowlist |
| `ApiKey` | Credentials for a client | `keyId` unique, `hash`, scopes, `revokedAt`, `lastUsedAt` |
| `Tenant` | A clinic inside a client app | `UNIQUE(clientId, externalRef)`; `externalRef` is the client's own opaque ID |
| `Connection` | One Google connection per tenant | `UNIQUE(tenantId)`; wrapped token, status `ACTIVE/NEEDS_REAUTH/DISCONNECTED`, `purgeReviewsAfter` |
| `LocationLink` | A Google location linked to a tenant | `googleLocationId` globally unique; `branchRef` opaque string from the client |
| `Review` | Synced review | `UNIQUE(tenantId, googleReviewId)`; soft-delete flag |
| `ReplyDraft` / `Reply` | AI draft, then posted reply | idempotency key; `approvedBy`; Google reply state |
| `SyncRun` | One sync attempt per connection | outcome, counts, error class (no tokens) |
| `OutboundWebhook` / `Delivery` | Optional push to client apps | signed payloads, retry state |
| `AuditLog` | Who did what | `clientId`, `tenantId`, actor type, actor ref, action, entity; no secrets or free-text PII |

**Row-level security (real, unlike SDPC today).** The service connects as a **non-owner, non-superuser** database role. Every request sets `app.client_id` (and `app.tenant_id` where relevant) in the transaction; RLS policies on every table restrict rows to those values. A forgotten `where` clause then returns nothing instead of leaking another client's data. Migrations run under a separate role.

**Data-access layer.** All queries go through one module that requires `(clientId, tenantId)`; no route touches Prisma directly. This also lets us route a client to its own database later (`clientId → connection string`) without touching routes.

## 5. Secrets and encryption

- **Refresh tokens:** envelope encryption. A data key per connection encrypts the token (AES-256-GCM); the data key is wrapped by a key in **Google Cloud KMS** (same Cloud project as the OAuth app). The service reaches KMS through short-lived credentials (workload identity from Vercel's OIDC token), so no long-lived key file exists.
- Decrypted tokens exist only in memory during a call and are never logged, returned or cached beyond the access-token TTL.
- Key rotation: KMS key versions rotate on a schedule; stored values record the key version so old ones remain decryptable and are re-wrapped lazily.
- All other secrets (OAuth client secret, API key pepper) live in Vercel encrypted env vars. Nobody has standing production database credentials; access is via a break-glass procedure that is audited.

## 6. API surface (v1)

All under `/v1`, JSON, authenticated with the client API key. Every route resolves `tenantRef` to a tenant **owned by the calling client** or returns 404.

- `POST /connect-sessions` — start the Google consent flow.
- `GET /tenants/{tenantRef}/connection` — status, Google email, last sync, errors.
- `DELETE /tenants/{tenantRef}/connection` — disconnect (revokes at Google, deletes token, schedules review purge in 30 days).
- `GET /tenants/{tenantRef}/available-locations` — locations visible to the tenant's Google account.
- `PUT /tenants/{tenantRef}/locations/{googleLocationId}` / `DELETE` — link or unlink, with opaque `branchRef`.
- `GET /tenants/{tenantRef}/reviews?since=&cursor=&locationRef=` — paginated reviews.
- `GET /tenants/{tenantRef}/summary` — average rating, counts, unreplied.
- `POST /tenants/{tenantRef}/reviews/{id}/reply-drafts` — AI draft.
- `POST /tenants/{tenantRef}/reviews/{id}/reply` — post to Google. Requires an `Idempotency-Key` and `approvedBy`.
- `DELETE /tenants/{tenantRef}` — erase all data for the tenant. `GET /tenants/{tenantRef}/export` — full export.
- `POST /internal/google/notifications` — Pub/Sub push (verified Google-signed token); never trusts payload tenant, looks it up from our own `LocationLink`.
- `GET /healthz`.

Outbound webhooks (`review.created`, `review.updated`) to a client-registered HTTPS URL, HMAC-signed, retried with backoff. Optional in v1; polling by the client works without them.

## 7. Sync

- Vercel Cron every 15 minutes, secured with `CRON_SECRET`; fans out per connection with a per-connection lock and isolated failures. Uses batch review retrieval.
- Pub/Sub push for new or updated reviews triggers a targeted sync; polling stays as the safety net. Wording to clients: "near real-time", not "real time".
- On `invalid_grant`, mark `NEEDS_REAUTH` (optimistic-locked on the exact token, as in Phase 1) and surface it through the connection status.
- Write-time rule carried over from the Phase 1 review: the sync writer re-verifies that the link still belongs to the tenant and is not deleted; reviews are always filtered by `tenantId`, never by link ID alone.

## 8. Replies and AI

- Drafts only; a human at the client approves each post. No auto-reply.
- **Hard rule: a reply must never confirm or imply that the reviewer was a patient or disclose any health detail.** A reply that says "we're glad your knee treatment went well" discloses health information in public. Drafts use generic thanks and a prompt to contact the clinic offline. The prompt enforces this and the draft is checked against it before it can be approved.
- No review gating. All reviews are treated alike.
- LLM: Gemini (Flash-Lite class) on Google's paid tier, ideally through Vertex AI in an India region if the chosen model is available there (verify before promising residency). Paid-tier content is not used to improve Google products or train models; the free tier is, so billing must be enabled before any real review text is sent. Review text is sent, nothing else. Google is already a sub-processor (Business Profile data, KMS), so this adds no new company.

## 9. Compliance controls

*Not legal advice. A lawyer should review the privacy policy and data processing agreement before the first outside client.*

- **Roles:** the clinic is the data fiduciary; TysonLabs is the processor. A data processing agreement per client states purpose, sub-processors (Vercel, Neon, Google Cloud, LLM provider), security measures, breach notification and deletion on termination.
- **Data inventory:** reviewer display name, rating, text, reply text, Google email of the connecting admin, Google credentials. No patient data, no payment data.
- **Google Limited Use:** data is used only to show the clinic its own reviews and post its own replies; never sold, never used for ads, never used to train models. Stated in the privacy policy.
- **Retention:** token deleted immediately on disconnect; reviews purged 30 days after disconnect; audit logs kept 12 months; backups roll off on a stated schedule. Retention periods to be confirmed with counsel.
- **Rights requests:** tenant export and erasure endpoints; erasure also covers backups on their normal expiry.
- **Breach readiness:** written runbook, contact list, and the client notification timeline in the DPA (confirm the exact statutory timeline under DPDP with counsel).
- **Logging:** structured logs carry IDs and error classes only. Never tokens, review text or reviewer names.
- **Access:** 2FA on every account that can reach production (GitHub, Vercel, Neon, Google Cloud). Dependency audit in CI.
- **Region:** choose the database region deliberately; check which regions the provider offers, since enterprise clients often ask for India. Not a statutory requirement in general, so confirm with counsel. **Neon has no India region (checked 2026-10-29; nearest are Singapore and Sydney).** For India-resident data use a Mumbai Postgres host (e.g. Supabase, AWS RDS or Cloud SQL, all to be verified) with RLS, PITR and separate roles; the schema is plain Postgres. Vercel functions can be pinned to Mumbai (bom1) regardless of the database host.

## 10. Backups and recovery

- Neon with point-in-time recovery enabled **and** a paid retention window (the free-tier 6-hour window is what failed on 2026-10-27).
- Scheduled `pg_dump` to durable storage outside Neon, encrypted, verified after each run (reuse the pattern from the SDPC backup scripts, including the size-drop and table-count guards).
- Targets: recovery point 1 hour, recovery time 4 hours. **A restore drill is run before launch and then quarterly**; a backup that has never been restored does not count.
- Destructive scripts require an explicit confirm flag and print what they will delete (per the team's data-safety rule).

## 11. Scale path

- v1: one database, logical isolation by `clientId`/`tenantId` with RLS.
- When a client needs it: route that client to a dedicated database via the data-access layer. No route changes.
- Cron fan-out moves to a queue when connections number in the hundreds. Google's default quota is 300 requests per minute; batch retrieval and push notifications keep usage well below it. Request a quota increase only when usage justifies it.

## 12. What changes in SDPC

- Delete the Phase 1 Prisma tables and the unapplied SQL. Nothing was applied, so there is nothing to roll back.
- SDPC stores no Google tokens. It keeps one server-side setting (the service's API key) and a mapping from its tenant and branch IDs to opaque refs.
- `/api/google/*` routes become thin server-side calls to the service. The Integrations page and nav entry stay; "Connect" starts a connect session.
- The dashboard card reads `summary` and `reviews` through the service with a short cache. The earlier single-tenant card (`eef4c6b`) is removed.
- Tenant isolation inside SDPC still follows `AGENTS.md`: the tenant is taken from the session, never from the request.

**Reused from Phase 1 with small changes:** OAuth + PKCE + signed state, location linking and takeover rules, the optimistic-lock patterns, the tests (re-pointed at the new data layer), the Integrations UI.
**New work:** client/API-key layer, RLS and the data-access layer, connect sessions, KMS envelope encryption, sync, reply drafts and posting, backups and the restore drill.

## 13. Phases

| Phase | Scope | Gate |
|---|---|---|
| 0 | New repo, new Neon project with PITR, Vercel project, `reviews.tysonlabs.in`, Cloud KMS key, Google Cloud project and API access request (yours) | Google API access approved |
| 1 | Clients, API keys, tenants, RLS, data-access layer, connect sessions, OAuth, KMS tokens, location linking | Isolation tests incl. a real database, security review |
| 2 | Sync, reviews and summary API, cron | Verified against a real Google account |
| 3 | Reply drafts, approve-and-post, push notifications, outbound webhooks | Reply-safety review |
| 4 | SDPC integration; remove Phase 1 tables from SDPC | End-to-end on SDPC |
| 5 | Hardening: threat-model review, restore drill, key-rotation drill, privacy policy and DPA reviewed | Launch checklist signed off |

## 14. Risks

- **Google approval** can take days to weeks and gates Phases 2–4. Phases 0–1 can be built and tested against a fake Google meanwhile.
- **Concentration risk:** many clients' tokens in one place. Mitigated by KMS envelope encryption, RLS, least privilege and audit, but it is a real tradeoff.
- **Scope sensitivity of `business.manage`** is unconfirmed; a "restricted" classification adds a security assessment and weeks.
- **Operational load:** a service needs monitoring, on-call and incident handling that an embedded feature did not.
- **Reply safety:** a bad AI draft is a privacy incident. Mitigated by human approval and the no-confirmation rule, not eliminated.

## 15. Decisions needed

1. Repo name and owner (proposed `manojtyson-37/tysonlabs-reviews`).
2. Database region and whether India matters for your first clients.
3. Cloud KMS from day one (recommended) versus a key in env vars for an interim phase.
4. Outbound webhooks in v1, or polling only.
5. ~~LLM provider~~ Decided: Gemini on the paid tier (confirm zero-retention/data-residency terms for the chosen model).
6. Retention numbers (30-day purge, 12-month audit) to confirm with counsel.
