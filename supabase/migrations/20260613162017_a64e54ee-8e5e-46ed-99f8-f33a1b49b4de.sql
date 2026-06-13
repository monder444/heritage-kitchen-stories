
CREATE TABLE IF NOT EXISTS public.magic_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title jsonb NOT NULL,
  description jsonb NOT NULL DEFAULT '{}'::jsonb,
  icon text NOT NULL DEFAULT 'cake',
  category text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.magic_prompts TO anon, authenticated;
GRANT ALL ON public.magic_prompts TO service_role;

ALTER TABLE public.magic_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prompts readable by everyone"
  ON public.magic_prompts FOR SELECT
  USING (true);

CREATE TRIGGER magic_prompts_touch BEFORE UPDATE ON public.magic_prompts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX magic_prompts_order_idx ON public.magic_prompts (display_order);

ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS prompt_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS source_year int,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_author text;

CREATE INDEX IF NOT EXISTS recipes_prompt_ids_idx ON public.recipes USING gin (prompt_ids);
CREATE INDEX IF NOT EXISTS recipes_category_idx ON public.recipes (category);
