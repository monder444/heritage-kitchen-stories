import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Recipe } from "./recipes";

const Bi = z.object({ sk: z.string().default(""), en: z.string().default("") });
const BiList = z.object({ sk: z.array(z.string()).default([]), en: z.array(z.string()).default([]) });

const RecipeInput = z.object({
  slug: z.string().min(1).max(120),
  title: Bi,
  image: z.string().max(2048).optional().nullable(),
  scan: z.string().max(2048).optional().nullable(),
  era: z.string().max(80).optional().nullable(),
  source: Bi.optional(),
  region: Bi.optional(),
  tag: Bi.optional(),
  premium: z.boolean().default(false),
  intro: Bi.optional(),
  originalLines: BiList.optional(),
  ingredients: BiList.optional(),
  method: BiList.optional(),
});

type Row = {
  id: string;
  slug: string;
  title: { sk: string; en: string };
  image: string | null;
  scan: string | null;
  era: string | null;
  source: { sk: string; en: string } | null;
  region: { sk: string; en: string } | null;
  tag: { sk: string; en: string } | null;
  premium: boolean;
  intro: { sk: string; en: string } | null;
  original_lines: { sk: string[]; en: string[] } | null;
  ingredients: { sk: string[]; en: string[] } | null;
  method: { sk: string[]; en: string[] } | null;
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=1200&q=80";

function rowToRecipe(row: Row): Recipe {
  return {
    id: row.id,
    title: row.title ?? { sk: "", en: "" },
    image: row.image || FALLBACK_IMG,
    scan: row.scan || row.image || FALLBACK_IMG,
    era: row.era ?? "",
    source: row.source ?? { sk: "", en: "" },
    region: row.region ?? { sk: "", en: "" },
    tag: row.tag ?? { sk: "", en: "" },
    premium: row.premium,
    intro: row.intro ?? { sk: "", en: "" },
    originalLines: row.original_lines ?? { sk: [], en: [] },
    ingredients: row.ingredients ?? { sk: [], en: [] },
    method: row.method ?? { sk: [], en: [] },
  };
}

function publicShape(r: Recipe): Recipe {
  // Strip premium-only content for non-entitled viewers.
  return {
    ...r,
    ingredients: { sk: [], en: [] },
    method: { sk: [], en: [] },
    originalLines: { sk: [], en: [] },
  };
}

/** Public list — returns every recipe with safe fields only; full body fetched per-recipe. */
export const listRecipesFn = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("recipes")
    .select("id,slug,title,image,scan,era,source,region,tag,premium,intro,original_lines,ingredients,method")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Row[]).map(rowToRecipe);
});

/** Returns a single recipe; strips body if premium and viewer lacks entitlement. */
export const getRecipeFn = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("recipes")
      .select("id,slug,title,image,scan,era,source,region,tag,premium,intro,original_lines,ingredients,method")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { recipe: null, locked: false } as const;

    const recipe = rowToRecipe(row as Row);
    if (!recipe.premium) return { recipe, locked: false } as const;

    // Premium row — check viewer entitlement using bearer header (optional).
    const entitled = await viewerIsEntitled();
    return entitled
      ? ({ recipe, locked: false } as const)
      : ({ recipe: publicShape(recipe), locked: true } as const);
  });

async function viewerIsEntitled(): Promise<boolean> {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    const auth = req?.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) return false;
    const token = auth.slice(7);
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await sb.auth.getClaims(token);
    const userId = data?.claims?.sub;
    if (!userId) return false;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
    return (roles ?? []).some((r) => r.role === "admin" || r.role === "premium");
  } catch {
    return false;
  }
}

async function requireAdminUserId(supabase: any, userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden: admin role required");
}

export const adminCreateRecipeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RecipeInput.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdminUserId(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = {
      slug: data.slug,
      title: data.title,
      image: data.image ?? null,
      scan: data.scan ?? null,
      era: data.era ?? null,
      source: data.source ?? null,
      region: data.region ?? null,
      tag: data.tag ?? null,
      premium: data.premium,
      intro: data.intro ?? null,
      original_lines: data.originalLines ?? null,
      ingredients: data.ingredients ?? null,
      method: data.method ?? null,
      created_by: context.userId,
    };
    const { data: row, error } = await supabaseAdmin
      .from("recipes")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const adminDeleteRecipeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdminUserId(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("recipes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
