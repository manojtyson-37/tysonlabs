-- Dashboard access: who may see which business. Additive.
-- A member is identified by the verified email of their Google sign-in. The tenant comes from this table, never from the request.
CREATE TABLE tenant_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  email text NOT NULL CHECK (email = lower(email) AND position('@' in email) > 1),
  role text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner','staff')),
  invited_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz,
  UNIQUE (tenant_id, email),
  FOREIGN KEY (client_id, tenant_id) REFERENCES tenants (client_id, id) ON DELETE CASCADE
);
CREATE INDEX tenant_members_email_idx ON tenant_members (email);
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_members FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant_members
  USING (client_id = app_client_id() AND (app_tenant_id() IS NULL OR tenant_id = app_tenant_id()))
  WITH CHECK (client_id = app_client_id() AND (app_tenant_id() IS NULL OR tenant_id = app_tenant_id()));
CREATE POLICY owner_admin ON tenant_members TO reviews_owner USING (true) WITH CHECK (true);
GRANT SELECT, INSERT, UPDATE ON tenant_members TO reviews_app;

-- Pre-authentication lookup: which tenants may this verified email open? Runs before any client scope exists, so it is the only way
-- around RLS here, and it returns only what the sign-in needs.
CREATE FUNCTION auth_member_tenants(p_email text)
RETURNS TABLE (client_id uuid, tenant_id uuid, external_ref text, role text)
LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT m.client_id, m.tenant_id, t.external_ref, m.role
  FROM tenant_members m
  JOIN tenants t ON t.id = m.tenant_id
  JOIN clients c ON c.id = m.client_id AND c.status = 'ACTIVE'
  WHERE m.email = lower(p_email)
$$;
REVOKE ALL ON FUNCTION auth_member_tenants(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION auth_member_tenants(text) TO reviews_app;

CREATE FUNCTION auth_member_login(p_email text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  UPDATE tenant_members SET last_login_at = now() WHERE email = lower(p_email)
$$;
REVOKE ALL ON FUNCTION auth_member_login(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION auth_member_login(text) TO reviews_app;
