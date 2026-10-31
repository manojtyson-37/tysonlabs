-- The purge now also clears what else identifies a disconnected tenant: the connecting Google account's email and the
-- sync history. Replaces the function from 0002. Additive: no table or column is dropped.
CREATE OR REPLACE FUNCTION cron_purge_expired()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE n integer;
BEGIN
  DELETE FROM reviews r USING connections c
   WHERE c.tenant_id = r.tenant_id AND c.status = 'DISCONNECTED' AND c.purge_reviews_after IS NOT NULL AND c.purge_reviews_after < now();
  GET DIAGNOSTICS n = ROW_COUNT;
  DELETE FROM sync_runs s USING connections c
   WHERE c.tenant_id = s.tenant_id AND c.status = 'DISCONNECTED' AND c.purge_reviews_after IS NOT NULL AND c.purge_reviews_after < now();
  UPDATE connections SET google_email = NULL
   WHERE status = 'DISCONNECTED' AND purge_reviews_after IS NOT NULL AND purge_reviews_after < now() AND google_email IS NOT NULL;
  DELETE FROM audit_log WHERE created_at < now() - interval '12 months';
  RETURN n;
END $$;
