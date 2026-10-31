-- Reviews, sync bookkeeping, reply drafts, and the cron-only functions. Run as the OWNER role after 0001.
-- Additive only: no existing table is dropped or rewritten.

ALTER TABLE connections
  ADD COLUMN sync_lock_until timestamptz,   -- lease: a sync holds it while running, so two crons never sync one tenant at once
  ADD COLUMN last_synced_at timestamptz,
  ADD COLUMN last_attempt_at timestamptz,   -- set on every attempt, so a tenant that keeps failing cannot starve the others
  ADD COLUMN last_sync_error text;          -- error class only, never a message that could hold review text or tokens

CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  google_location_id text NOT NULL,
  google_review_id text NOT NULL,
  reviewer_name text,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  google_create_time timestamptz NOT NULL,
  google_update_time timestamptz NOT NULL,
  reply_text text,                          -- the reply as it stands on Google
  reply_time timestamptz,
  deleted_at timestamptz,                   -- soft delete when Google stops returning the review
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, google_review_id),
  UNIQUE (id, tenant_id),
  FOREIGN KEY (client_id, tenant_id) REFERENCES tenants (client_id, id) ON DELETE CASCADE
);
CREATE INDEX reviews_tenant_time_idx ON reviews (tenant_id, google_create_time DESC, id);

CREATE TABLE reply_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  review_id uuid NOT NULL,
  text text NOT NULL,
  source text NOT NULL CHECK (source IN ('ai','template','edited')),
  safety_ok boolean NOT NULL,               -- passed the no-patient-confirmation / no-health-detail check
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','POSTING','POSTED','FAILED')),
  idempotency_key text,
  approved_by text,
  posting_since timestamptz,                -- when the claim began; a stale POSTING row can be reclaimed
  FOREIGN KEY (review_id, tenant_id) REFERENCES reviews (id, tenant_id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  posted_at timestamptz,
  FOREIGN KEY (client_id, tenant_id) REFERENCES tenants (client_id, id) ON DELETE CASCADE
);
-- One post attempt per idempotency key per tenant: a retried request returns the first result instead of posting twice.
CREATE UNIQUE INDEX reply_drafts_idem_idx ON reply_drafts (tenant_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
-- At most one reply may be in flight or posted per review.
CREATE UNIQUE INDEX reply_drafts_one_live_idx ON reply_drafts (review_id) WHERE status IN ('POSTING','POSTED');

CREATE TABLE sync_runs (
  id bigserial PRIMARY KEY,
  client_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  outcome text,                             -- 'ok' | 'needs_reauth' | 'google_error' | 'skipped'
  reviews_seen integer NOT NULL DEFAULT 0,
  FOREIGN KEY (client_id, tenant_id) REFERENCES tenants (client_id, id) ON DELETE CASCADE
);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['reviews','reply_drafts','sync_runs'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY tenant_isolation ON %I USING (client_id = app_client_id() AND (app_tenant_id() IS NULL OR tenant_id = app_tenant_id())) WITH CHECK (client_id = app_client_id() AND (app_tenant_id() IS NULL OR tenant_id = app_tenant_id()))', t);
    EXECUTE format('CREATE POLICY owner_admin ON %I TO reviews_owner USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON reviews, reply_drafts TO reviews_app;
GRANT SELECT, INSERT, UPDATE ON sync_runs TO reviews_app;
GRANT USAGE ON SEQUENCE sync_runs_id_seq TO reviews_app;

-- Cron has no client scope, so these two definer functions are its only way across tenants. They expose ids only.
CREATE FUNCTION cron_due_connections(p_limit integer)
RETURNS TABLE (client_id uuid, tenant_id uuid)
LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT c.client_id, c.tenant_id FROM connections c
  JOIN clients cl ON cl.id = c.client_id AND cl.status = 'ACTIVE'
  WHERE c.status = 'ACTIVE' AND (c.sync_lock_until IS NULL OR c.sync_lock_until < now())
  ORDER BY c.last_attempt_at NULLS FIRST LIMIT p_limit
$$;

-- Deletes reviews (and their drafts, by cascade) for connections disconnected more than 30 days ago, and audit rows older
-- than 12 months. Returns how many reviews were removed.
CREATE FUNCTION cron_purge_expired()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE n integer;
BEGIN
  DELETE FROM reviews r USING connections c
   WHERE c.tenant_id = r.tenant_id AND c.status = 'DISCONNECTED' AND c.purge_reviews_after IS NOT NULL AND c.purge_reviews_after < now();
  GET DIAGNOSTICS n = ROW_COUNT;
  DELETE FROM audit_log WHERE created_at < now() - interval '12 months';
  RETURN n;
END $$;

-- Erasure: removes the audit rows that name the tenant. Bound to the caller's own client scope, so it cannot touch another client.
CREATE FUNCTION erase_tenant_audit(p_tenant uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE n integer;
BEGIN
  IF app_client_id() IS NULL THEN RETURN 0; END IF;
  DELETE FROM audit_log WHERE client_id = app_client_id() AND tenant_id = p_tenant;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;

REVOKE ALL ON FUNCTION cron_due_connections(integer), cron_purge_expired(), erase_tenant_audit(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION cron_due_connections(integer), cron_purge_expired(), erase_tenant_audit(uuid) TO reviews_app;
