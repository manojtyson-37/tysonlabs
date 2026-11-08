-- Subscription billing (Razorpay Subscriptions). Additive: new tables and functions only, no existing row is changed or deleted.
-- Every business that exists when this runs is seeded as 'pilot' (never gated), so the live syncs of the current businesses cannot stop.

-- One transaction: the tenants lock taken for the seed is held until the trigger exists, so no business can slip through unseeded.
BEGIN;

-- One row of global settings, changed only by TysonLabs admins through billing_settings_set().
CREATE TABLE billing_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  trial_days integer NOT NULL DEFAULT 30 CHECK (trial_days BETWEEN 0 AND 365),
  trial_requires_card boolean NOT NULL DEFAULT false,
  price_inr integer NOT NULL DEFAULT 799 CHECK (price_inr BETWEEN 1 AND 1000000), -- per month, before GST
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text
);
INSERT INTO billing_settings DEFAULT VALUES;
ALTER TABLE billing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_settings FORCE ROW LEVEL SECURITY;
CREATE POLICY owner_admin ON billing_settings TO reviews_owner USING (true) WITH CHECK (true);

CREATE TABLE tenant_billing (
  tenant_id uuid PRIMARY KEY,
  client_id uuid NOT NULL,
  state text NOT NULL CHECK (state IN ('trial','needs_card','active','past_due','cancel_pending','cancelled','paused','pilot')),
  trial_ends_at timestamptz,                 -- NULL until the business first connects Google (the trial starts then)
  razorpay_subscription_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  past_due_since timestamptz,                -- start of the grace period
  paused_from text,                          -- the state an admin pause interrupted, so a resume can put it back
  ended_subscription_id text,                -- a subscription that has ended: its late charged/activated events must not reopen access
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (client_id, tenant_id) REFERENCES tenants (client_id, id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX tenant_billing_subscription_idx ON tenant_billing (razorpay_subscription_id) WHERE razorpay_subscription_id IS NOT NULL;
ALTER TABLE tenant_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_billing FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant_billing
  USING (client_id = app_client_id() AND (app_tenant_id() IS NULL OR tenant_id = app_tenant_id()))
  WITH CHECK (client_id = app_client_id() AND (app_tenant_id() IS NULL OR tenant_id = app_tenant_id()));
CREATE POLICY owner_admin ON tenant_billing TO reviews_owner USING (true) WITH CHECK (true);
GRANT SELECT ON tenant_billing TO reviews_app; -- writes only through the SECURITY DEFINER functions below

-- Processed webhook event ids: a repeated delivery is acknowledged and ignored. Not reachable by the app role except via the function.
CREATE TABLE billing_events (
  event_id text PRIMARY KEY CHECK (length(event_id) <= 200),
  type text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events FORCE ROW LEVEL SECURITY;
CREATE POLICY owner_admin ON billing_events TO reviews_owner USING (true) WITH CHECK (true);

-- Existing businesses: grandfathered. The lock keeps a business created while this runs from being missed by the seed (it would
-- otherwise fall through to no row, which the gate treats as blocked). Nothing may start without the settings row either.
DO $$ BEGIN
  IF (SELECT count(*) FROM billing_settings) <> 1 THEN RAISE EXCEPTION 'billing_settings must hold exactly one row'; END IF;
END $$;
LOCK TABLE tenants IN SHARE ROW EXCLUSIVE MODE;
INSERT INTO tenant_billing (client_id, tenant_id, state) SELECT client_id, id, 'pilot' FROM tenants;

-- New businesses start in a trial (or must add a card first, when the global setting says so). Runs for every insert path.
CREATE FUNCTION billing_on_tenant_insert() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  INSERT INTO public.tenant_billing (client_id, tenant_id, state)
  SELECT NEW.client_id, NEW.id, CASE WHEN s.trial_requires_card THEN 'needs_card' ELSE 'trial' END FROM public.billing_settings s
  ON CONFLICT (tenant_id) DO NOTHING;
  IF NOT FOUND AND NOT EXISTS (SELECT 1 FROM public.tenant_billing WHERE tenant_id = NEW.id) THEN
    RAISE EXCEPTION 'billing_settings is empty: refusing to create a business without a billing row';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER billing_on_tenant_insert AFTER INSERT ON tenants FOR EACH ROW EXECUTE FUNCTION billing_on_tenant_insert();

-- The trial clock starts when the business first connects Google, not when its row is created.
CREATE FUNCTION billing_on_connection_insert() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  UPDATE public.tenant_billing b SET trial_ends_at = now() + make_interval(days => s.trial_days), updated_at = now()
  FROM public.billing_settings s WHERE b.tenant_id = NEW.tenant_id AND b.state = 'trial' AND b.trial_ends_at IS NULL;
  RETURN NEW;
END $$;
CREATE TRIGGER billing_on_connection_insert AFTER INSERT ON connections FOR EACH ROW EXECUTE FUNCTION billing_on_connection_insert();

CREATE FUNCTION billing_settings_get()
RETURNS TABLE (trial_days integer, trial_requires_card boolean, price_inr integer)
LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT trial_days, trial_requires_card, price_inr FROM public.billing_settings WHERE id
$$;

-- NULL keeps the current value.
CREATE FUNCTION billing_settings_set(p_trial_days integer, p_trial_requires_card boolean, p_price_inr integer, p_by text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  UPDATE public.billing_settings SET trial_days = COALESCE(p_trial_days, trial_days),
    trial_requires_card = COALESCE(p_trial_requires_card, trial_requires_card), price_inr = COALESCE(p_price_inr, price_inr),
    updated_at = now(), updated_by = left(p_by, 200) WHERE id
$$;

-- The one writer of tenant_billing. NULL keeps the current value. Not callable by the app role: the two entry points below are.
-- Maintains: past_due_since (grace counts from when the state became past_due), paused_from (what a pause interrupted), and the rule
-- that a state explicitly set to 'trial' always has an end date (default: now + trial_days).
CREATE FUNCTION billing_apply_internal(p_client uuid, p_tenant uuid, p_state text, p_trial_ends_at timestamptz, p_subscription_id text,
                                       p_period_end timestamptz, p_cancel_at_end boolean, p_clear_subscription boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE r public.tenant_billing%ROWTYPE; ns text; trial timestamptz;
BEGIN
  SELECT * INTO r FROM public.tenant_billing WHERE tenant_id = p_tenant AND client_id = p_client FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  ns := COALESCE(p_state, r.state);
  trial := COALESCE(p_trial_ends_at, r.trial_ends_at);
  IF p_state = 'trial' AND trial IS NULL THEN
    SELECT now() + make_interval(days => trial_days) INTO trial FROM public.billing_settings WHERE id;
  END IF;
  UPDATE public.tenant_billing SET
    state = ns,
    trial_ends_at = trial,
    razorpay_subscription_id = CASE WHEN p_clear_subscription THEN NULL ELSE COALESCE(p_subscription_id, r.razorpay_subscription_id) END,
    current_period_end = CASE WHEN p_clear_subscription THEN NULL ELSE COALESCE(p_period_end, r.current_period_end) END,
    cancel_at_period_end = CASE WHEN p_clear_subscription THEN false ELSE COALESCE(p_cancel_at_end, r.cancel_at_period_end) END,
    past_due_since = CASE WHEN ns = 'past_due' THEN CASE WHEN r.state = 'past_due' THEN COALESCE(r.past_due_since, now()) ELSE now() END END,
    paused_from = CASE WHEN ns = 'paused' THEN CASE WHEN r.state = 'paused' THEN r.paused_from ELSE r.state END END,
    updated_at = now()
  WHERE tenant_id = p_tenant AND client_id = p_client;
  RETURN true;
END $$;

-- App entry point: only for the business named by the request's own scope (withScope sets app.client_id / app.tenant_id).
CREATE FUNCTION billing_apply(p_client uuid, p_tenant uuid, p_state text, p_trial_ends_at timestamptz, p_subscription_id text,
                              p_period_end timestamptz, p_cancel_at_end boolean, p_clear_subscription boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF p_client IS DISTINCT FROM app_client_id() OR (app_tenant_id() IS NOT NULL AND app_tenant_id() <> p_tenant) THEN
    RAISE EXCEPTION 'billing_apply outside the request scope' USING ERRCODE = '42501';
  END IF;
  RETURN public.billing_apply_internal(p_client, p_tenant, p_state, p_trial_ends_at, p_subscription_id, p_period_end, p_cancel_at_end, p_clear_subscription);
END $$;

-- Subscribe race guard: stores the new subscription id only if the row still holds the id the caller saw (NULL included).
-- Returns false for the loser of two simultaneous subscribe calls, who must then stop its own subscription.
CREATE FUNCTION billing_claim_subscription(p_client uuid, p_tenant uuid, p_expected text, p_new text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE n integer;
BEGIN
  IF p_client IS DISTINCT FROM app_client_id() OR (app_tenant_id() IS NOT NULL AND app_tenant_id() <> p_tenant) THEN
    RAISE EXCEPTION 'billing_claim_subscription outside the request scope' USING ERRCODE = '42501';
  END IF;
  UPDATE public.tenant_billing SET razorpay_subscription_id = p_new, updated_at = now()
    WHERE tenant_id = p_tenant AND client_id = p_client AND razorpay_subscription_id IS NOT DISTINCT FROM p_expected;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n > 0;
END $$;

-- Webhook side, one atomic step: find the business by subscription id, record the event id, apply the change. A repeated event id
-- returns 'duplicate' and changes nothing; an unknown subscription returns 'unknown' and records nothing; an event that would undo
-- a newer fact (a late charge for a subscription that has ended, an authentication after payment) returns 'stale'.
CREATE FUNCTION billing_webhook_apply(p_event_id text, p_type text, p_subscription_id text, p_state text, p_period_end timestamptz, p_trial_end timestamptz)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE r public.tenant_billing%ROWTYPE; n integer; new_state text;
BEGIN
  SELECT * INTO r FROM public.tenant_billing WHERE razorpay_subscription_id = p_subscription_id FOR UPDATE;
  IF NOT FOUND THEN RETURN 'unknown'; END IF;
  INSERT INTO public.billing_events (event_id, type) VALUES (p_event_id, p_type) ON CONFLICT (event_id) DO NOTHING;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n = 0 THEN RETURN 'duplicate'; END IF;
  -- Only a NEW subscription id (set by subscribe) may take a business out of 'cancelled'; the ended one cannot.
  -- Once a subscription has ended, nothing but a repeat of its cancellation is accepted for it (a late halted, charged, activated...).
  IF r.ended_subscription_id = p_subscription_id AND p_state <> 'cancelled' THEN RETURN 'stale'; END IF;
  IF p_type = 'subscription.authenticated' AND r.state NOT IN ('needs_card','trial') THEN RETURN 'stale'; END IF;
  new_state := p_state;
  IF r.state = 'paused' THEN new_state := 'paused';                                   -- an admin pause is not undone by a payment event
  ELSIF r.state = 'cancel_pending' AND p_state IN ('active','trial') THEN new_state := 'cancel_pending'; END IF; -- nor is a cancellation request
  PERFORM public.billing_apply_internal(r.client_id, r.tenant_id, new_state, CASE WHEN new_state = 'trial' THEN p_trial_end END, NULL, p_period_end,
                                        CASE WHEN new_state = 'active' THEN false END, false);
  IF new_state = 'cancelled' THEN UPDATE public.tenant_billing SET ended_subscription_id = p_subscription_id WHERE tenant_id = r.tenant_id; END IF;
  INSERT INTO public.audit_log (client_id, tenant_id, actor_type, actor_ref, action, entity)
    VALUES (r.client_id, r.tenant_id, 'system', 'razorpay', 'billing.webhook', left(p_type || ':' || new_state, 200));
  RETURN 'applied';
END $$;

REVOKE ALL ON FUNCTION billing_on_tenant_insert(), billing_on_connection_insert(), billing_settings_get(),
  billing_settings_set(integer, boolean, integer, text),
  billing_apply_internal(uuid, uuid, text, timestamptz, text, timestamptz, boolean, boolean),
  billing_apply(uuid, uuid, text, timestamptz, text, timestamptz, boolean, boolean),
  billing_claim_subscription(uuid, uuid, text, text),
  billing_webhook_apply(text, text, text, text, timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION billing_settings_get(), billing_settings_set(integer, boolean, integer, text),
  billing_apply(uuid, uuid, text, timestamptz, text, timestamptz, boolean, boolean),
  billing_claim_subscription(uuid, uuid, text, text),
  billing_webhook_apply(text, text, text, text, timestamptz, timestamptz) TO reviews_app;

COMMIT;
