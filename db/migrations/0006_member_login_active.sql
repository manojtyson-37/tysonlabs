-- Only active clients' members get a login timestamp, matching auth_member_tenants. Replaces the function from 0005.
CREATE OR REPLACE FUNCTION auth_member_login(p_email text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  UPDATE tenant_members m SET last_login_at = now()
  FROM clients c WHERE c.id = m.client_id AND c.status = 'ACTIVE' AND m.email = lower(p_email)
$$;
