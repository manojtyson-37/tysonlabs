-- Web push for new reviews. A subscription belongs to a signed-in person (verified email), not to one business: the same device
-- hears about every business that person is a member of. Additive.
CREATE TABLE push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (email = lower(email) AND position('@' in email) > 1),
  endpoint text NOT NULL UNIQUE CHECK (endpoint LIKE 'https://%' AND length(endpoint) <= 2048),
  p256dh text NOT NULL CHECK (length(p256dh) <= 256),
  auth text NOT NULL CHECK (length(auth) <= 128),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_ok_at timestamptz
);
CREATE INDEX push_subscriptions_email_idx ON push_subscriptions (email);
-- No tenant or client column, so no scoped policy can apply. The app role gets no table privileges at all and reaches the rows only
-- through the SECURITY DEFINER functions below, each of which is limited to one email or one tenant.
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions FORCE ROW LEVEL SECURITY;
CREATE POLICY owner_admin ON push_subscriptions TO reviews_owner USING (true) WITH CHECK (true);

-- Saves a device for this person. Returns 'ok', 'cap' (already p_max other devices) or 'taken' (the endpoint is saved under another
-- email: it only moves once that person's unsubscribe has deleted it, so one account can never take over another's device row).
-- The advisory lock makes the device cap hold when two requests for the same email race.
CREATE FUNCTION push_save(p_email text, p_endpoint text, p_p256dh text, p_auth text, p_max integer)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE n integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(lower(p_email)));
  IF EXISTS (SELECT 1 FROM public.push_subscriptions WHERE endpoint = p_endpoint AND email <> lower(p_email)) THEN RETURN 'taken'; END IF;
  SELECT count(*) INTO n FROM public.push_subscriptions WHERE email = lower(p_email) AND endpoint <> p_endpoint;
  IF n >= p_max THEN RETURN 'cap'; END IF;
  INSERT INTO public.push_subscriptions (email, endpoint, p256dh, auth) VALUES (lower(p_email), p_endpoint, p_p256dh, p_auth)
    ON CONFLICT (endpoint) DO UPDATE SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth WHERE public.push_subscriptions.email = EXCLUDED.email;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n = 0 THEN RETURN 'taken'; END IF;
  RETURN 'ok';
END $$;
REVOKE ALL ON FUNCTION push_save(text, text, text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION push_save(text, text, text, text, integer) TO reviews_app;

-- Deletes only the caller's own device.
CREATE FUNCTION push_delete_own(p_email text, p_endpoint text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  DELETE FROM public.push_subscriptions WHERE endpoint = p_endpoint AND email = lower(p_email)
$$;
REVOKE ALL ON FUNCTION push_delete_own(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION push_delete_own(text, text) TO reviews_app;

-- Sender side: the devices of the members of one business (of an active client).
CREATE FUNCTION push_for_tenant(p_client_id uuid, p_tenant_id uuid)
RETURNS TABLE (endpoint text, p256dh text, auth text)
LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT DISTINCT s.endpoint, s.p256dh, s.auth FROM public.push_subscriptions s
  JOIN public.tenant_members m ON m.email = s.email AND m.tenant_id = p_tenant_id AND m.client_id = p_client_id
  JOIN public.tenants t ON t.client_id = m.client_id AND t.id = m.tenant_id
  JOIN public.clients c ON c.id = t.client_id AND c.status = 'ACTIVE'
$$;
REVOKE ALL ON FUNCTION push_for_tenant(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION push_for_tenant(uuid, uuid) TO reviews_app;

-- Sender bookkeeping: mark a delivery as good, or drop a device the push service says is gone.
CREATE FUNCTION push_mark_ok(p_endpoint text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  UPDATE public.push_subscriptions SET last_ok_at = now() WHERE endpoint = p_endpoint
$$;
CREATE FUNCTION push_drop(p_endpoint text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  DELETE FROM public.push_subscriptions WHERE endpoint = p_endpoint
$$;
REVOKE ALL ON FUNCTION push_mark_ok(text), push_drop(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION push_mark_ok(text), push_drop(text) TO reviews_app;
