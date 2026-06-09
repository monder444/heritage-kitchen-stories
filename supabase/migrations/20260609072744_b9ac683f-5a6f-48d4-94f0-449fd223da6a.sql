
-- Lock down trigger/helper functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;

-- Fix search_path
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Explicit deny-all policies for recipes (server-only via service_role)
CREATE POLICY "recipes no client select" ON public.recipes FOR SELECT USING (false);
CREATE POLICY "recipes no client insert" ON public.recipes FOR INSERT WITH CHECK (false);
CREATE POLICY "recipes no client update" ON public.recipes FOR UPDATE USING (false);
CREATE POLICY "recipes no client delete" ON public.recipes FOR DELETE USING (false);
