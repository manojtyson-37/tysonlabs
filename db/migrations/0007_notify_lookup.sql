-- Google pushes review notifications that name only a location. This is the one way to find which business it belongs to
-- before any client scope exists. Returns ids only, for an active connection of an active client.
CREATE FUNCTION notify_lookup_location(p_location_id text)
RETURNS TABLE (client_id uuid, tenant_id uuid)
LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT l.client_id, l.tenant_id FROM location_links l
  JOIN connections c ON c.tenant_id = l.tenant_id AND c.status = 'ACTIVE'
  JOIN clients cl ON cl.id = l.client_id AND cl.status = 'ACTIVE'
  WHERE l.google_location_id = p_location_id
$$;
REVOKE ALL ON FUNCTION notify_lookup_location(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION notify_lookup_location(text) TO reviews_app;
