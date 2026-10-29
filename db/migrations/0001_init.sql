-- TysonLabs Reviews Service: initial schema with row-level security.
-- Run as the OWNER role (reviews_owner). The service connects as reviews_app (see db/roles.sql),
-- which owns nothing and has no BYPASSRLS, so every table below is filtered by RLS.


-- Current request scope, set per transaction by the data-access layer. NULL when unset,
-- which makes every policy below match zero rows (fail closed).
CREATE FUNCTION app_client_id() RETURNS uuid LANGUAGE sql STABLE AS
$$ SELECT NULLIF(current_setting('app.client_id', true), '')::uuid $$;
CREATE FUNCTION app_tenant_id() RETURNS uuid LANGUAGE sql STABLE AS
$$ SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid $$;

CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED')),
  allowed_return_urls text[] NOT NULL DEFAULT '{}',
  ip_allowlist text[] NOT NULL DEFAULT '{}',
  max_tenants integer NOT NULL DEFAULT 1000,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  key_id text NOT NULL UNIQUE,            -- public part of the key, used for lookup
  secret_hash bytea NOT NULL,             -- HMAC-SHA256(pepper, secret); the secret itself is never stored
  scopes text[] NOT NULL DEFAULT '{connect,read,write}',
  revoked_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  external_ref text NOT NULL,             -- the client app's own opaque tenant id
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, external_ref),
  UNIQUE (client_id, id)                  -- lets child tables prove tenant belongs to client
);

CREATE TABLE connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','NEEDS_REAUTH','DISCONNECTED')),
  google_email text,
  scope text NOT NULL DEFAULT '',
  -- Envelope encryption: token encrypted with a per-connection data key; the data key is wrapped by the KEK/KMS.
  token_ciphertext text,
  wrapped_data_key text,
  key_version text,
  purge_reviews_after timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id),
  FOREIGN KEY (client_id, tenant_id) REFERENCES tenants (client_id, id) ON DELETE CASCADE
);

CREATE TABLE location_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  google_account_id text NOT NULL,
  google_location_id text NOT NULL UNIQUE,   -- globally unique: one Google location, one tenant
  name text NOT NULL,
  branch_ref text,                           -- opaque string owned by the client app
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (client_id, tenant_id) REFERENCES tenants (client_id, id) ON DELETE CASCADE
);

CREATE TABLE connect_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  secret_hash bytea NOT NULL,                -- hash of the one-time URL secret
  return_url text NOT NULL,
  state_hash bytea,                          -- set when the browser starts consent
  code_verifier_ciphertext text,             -- PKCE verifier, encrypted
  expires_at timestamptz NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (client_id, tenant_id) REFERENCES tenants (client_id, id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX connect_sessions_state_hash_idx ON connect_sessions (state_hash) WHERE state_hash IS NOT NULL;

CREATE TABLE audit_log (
  id bigserial PRIMARY KEY,
  client_id uuid NOT NULL,
  tenant_id uuid,
  actor_type text NOT NULL,                  -- 'client' | 'system'
  actor_ref text,                            -- api key id, never a secret
  action text NOT NULL,
  entity text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Fixed-window rate limiting shared by all serverless instances. No client data, so no RLS; the app role
-- can only call rate_limit_hit(), never read or write the table directly.
CREATE TABLE rate_limits (
  bucket text NOT NULL,
  window_start timestamptz NOT NULL,
  hits integer NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, window_start)
);

-- Row-level security: every table is filtered to the current client, and by tenant when one is set.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['api_keys','tenants','connections','location_links','connect_sessions','audit_log'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients FORCE ROW LEVEL SECURITY;
CREATE POLICY client_isolation ON clients USING (id = app_client_id());
CREATE POLICY client_isolation ON api_keys USING (client_id = app_client_id());
CREATE POLICY client_isolation ON tenants USING (client_id = app_client_id())
  WITH CHECK (client_id = app_client_id());
CREATE POLICY tenant_isolation ON connections
  USING (client_id = app_client_id() AND (app_tenant_id() IS NULL OR tenant_id = app_tenant_id()))
  WITH CHECK (client_id = app_client_id() AND (app_tenant_id() IS NULL OR tenant_id = app_tenant_id()));
CREATE POLICY tenant_isolation ON location_links
  USING (client_id = app_client_id() AND (app_tenant_id() IS NULL OR tenant_id = app_tenant_id()))
  WITH CHECK (client_id = app_client_id() AND (app_tenant_id() IS NULL OR tenant_id = app_tenant_id()));
CREATE POLICY tenant_isolation ON connect_sessions
  USING (client_id = app_client_id() AND (app_tenant_id() IS NULL OR tenant_id = app_tenant_id()))
  WITH CHECK (client_id = app_client_id() AND (app_tenant_id() IS NULL OR tenant_id = app_tenant_id()));
CREATE POLICY client_isolation ON audit_log USING (client_id = app_client_id())
  WITH CHECK (client_id = app_client_id());

-- FORCE RLS filters even the table owner. The owner role is for migrations and break-glass admin work
-- (provisioning clients, incident response), so it gets an explicit all-rows policy. The application role does not.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['clients','api_keys','tenants','connections','location_links','connect_sessions','audit_log'] LOOP
    EXECUTE format('CREATE POLICY owner_admin ON %I TO reviews_owner USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

-- Pre-authentication lookups. These run before the caller's client is known, so they are the ONLY way
-- around RLS, and each returns exactly one row keyed by an unguessable value.
CREATE FUNCTION auth_lookup_api_key(p_key_id text)
RETURNS TABLE (api_key_id uuid, client_id uuid, secret_hash bytea, scopes text[], revoked_at timestamptz,
               client_status text, ip_allowlist text[])
LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT k.id, k.client_id, k.secret_hash, k.scopes, k.revoked_at, c.status, c.ip_allowlist
  FROM api_keys k JOIN clients c ON c.id = k.client_id WHERE k.key_id = p_key_id
$$;

CREATE FUNCTION auth_open_connect_session(p_session_id uuid, p_secret_hash bytea, p_state_hash bytea, p_verifier_ciphertext text)
RETURNS TABLE (client_id uuid, tenant_id uuid)
LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  UPDATE connect_sessions SET started_at = now(), state_hash = p_state_hash, code_verifier_ciphertext = p_verifier_ciphertext
  WHERE id = p_session_id AND secret_hash = p_secret_hash AND started_at IS NULL AND expires_at > now()
  RETURNING connect_sessions.client_id, connect_sessions.tenant_id
$$;

CREATE FUNCTION auth_complete_connect_session(p_state_hash bytea)
RETURNS TABLE (id uuid, client_id uuid, tenant_id uuid, return_url text, code_verifier_ciphertext text)
LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  UPDATE connect_sessions SET completed_at = now()
  WHERE state_hash = p_state_hash AND started_at IS NOT NULL AND completed_at IS NULL AND expires_at > now()
    AND EXISTS (SELECT 1 FROM clients c WHERE c.id = connect_sessions.client_id AND c.status = 'ACTIVE')
  RETURNING connect_sessions.id, connect_sessions.client_id, connect_sessions.tenant_id,
            connect_sessions.return_url, connect_sessions.code_verifier_ciphertext
$$;

-- Returns true while the caller is within `p_limit` hits for the current window, false once exceeded.
CREATE FUNCTION rate_limit_hit(p_bucket text, p_limit integer, p_window_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE w timestamptz; n integer;
BEGIN
  w := to_timestamp(floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds);
  INSERT INTO rate_limits (bucket, window_start, hits) VALUES (p_bucket, w, 1)
    ON CONFLICT (bucket, window_start) DO UPDATE SET hits = rate_limits.hits + 1 RETURNING hits INTO n;
  IF random() < 0.01 THEN DELETE FROM rate_limits WHERE window_start < now() - interval '1 day'; END IF;
  RETURN n <= p_limit;
END $$;

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON FUNCTION rate_limit_hit(text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION auth_lookup_api_key(text), auth_open_connect_session(uuid, bytea, bytea, text),
  auth_complete_connect_session(bytea) FROM PUBLIC;

-- Grants for the application role (created out of band, see db/roles.sql).
GRANT USAGE ON SCHEMA public TO reviews_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON tenants, connections, location_links, connect_sessions TO reviews_app;
GRANT SELECT, UPDATE (last_used_at) ON api_keys TO reviews_app;
GRANT SELECT ON clients TO reviews_app;
GRANT SELECT, INSERT ON audit_log TO reviews_app;
GRANT USAGE ON SEQUENCE audit_log_id_seq TO reviews_app;
GRANT EXECUTE ON FUNCTION rate_limit_hit(text, integer, integer), app_client_id(), app_tenant_id(), auth_lookup_api_key(text),
  auth_open_connect_session(uuid, bytea, bytea, text), auth_complete_connect_session(bytea) TO reviews_app;
