
-- telegram_bot_state: drop public policies, deny all to anon/authenticated (service_role bypasses RLS)
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='telegram_bot_state' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.telegram_bot_state', pol.policyname);
  END LOOP;
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='user_credentials' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_credentials', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.telegram_bot_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.telegram_bot_state FROM anon, authenticated;
REVOKE ALL ON public.user_credentials FROM anon, authenticated;
