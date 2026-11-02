-- Hard rule: nothing destructive happens on one call. A deletion is requested, confirmed once, then confirmed a second time.
-- This table holds the pending request; the secrets are stored only as hashes. Additive migration.
CREATE TABLE deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('erase_tenant','disconnect','unlink_location')),
  target text,                              -- location id for unlink_location
  phrase text NOT NULL,                     -- exact words the caller must send back, twice
  summary jsonb NOT NULL,                   -- what will be deleted, shown at request time
  step1_hash bytea NOT NULL,
  step2_hash bytea,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','CONFIRMED_ONCE','EXECUTING','DONE','CANCELLED')),
  attempts integer NOT NULL DEFAULT 0,      -- wrong confirmations; five cancel the request
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (client_id, tenant_id) REFERENCES tenants (client_id, id) ON DELETE CASCADE
);
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE deletion_requests FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON deletion_requests
  USING (client_id = app_client_id() AND (app_tenant_id() IS NULL OR tenant_id = app_tenant_id()))
  WITH CHECK (client_id = app_client_id() AND (app_tenant_id() IS NULL OR tenant_id = app_tenant_id()));
CREATE POLICY owner_admin ON deletion_requests TO reviews_owner USING (true) WITH CHECK (true);
GRANT SELECT, INSERT, UPDATE ON deletion_requests TO reviews_app;
