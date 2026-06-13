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
  promptIds: z.array(z.string().uuid()).default([]),
  category: z.string().max(60).optional().nullable(),
  sourceYear: z.number().int().min(0).max(3000).optional().nullable(),
  sourceUrl: z.string().max(2048).optional().nullable(),
  sourceAuthor: z.string().max(200).optional().nullable(),
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
  prompt_ids: string[] | null;
  category: string | null;
  source_year: number | null;
  source_url: string | null;
  source_author: string | null;
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=1200&q=80";
const ROW_COLS = "id,slug,title,image,scan,era,source,region,tag,premium,intro,original_lines,ingredients,method,prompt_ids,category,source_year,source_url,source_author";

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
    promptIds: row.prompt_ids ?? [],
    category: row.category,
    sourceYear: row.source_year,
    sourceUrl: row.source_url,
    sourceAuthor: row.source_author,
  };
}

function publicShape(r: Recipe): Recipe {
  return { ...r, ingredients: { sk: [], en: [] }, method: { sk: [], en: [] }, originalLines: { sk: [], en: [] } };
}

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

export const listRecipesFn = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("recipes").select(ROW_COLS).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const entitled = await viewerIsEntitled();
  return (data as Row[]).map((row) => {
    const r = rowToRecipe(row);
    return r.premium && !entitled ? publicShape(r) : r;
  });
});

export const listRecipesByPromptFn = createServerFn({ method: "GET" })
  .inputValidator((d: { promptId: string }) => z.object({ promptId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("recipes")
      .select(ROW_COLS)
      .contains("prompt_ids", [data.promptId])
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const entitled = await viewerIsEntitled();
    return (rows as Row[]).map((row) => {
      const r = rowToRecipe(row);
      return r.premium && !entitled ? publicShape(r) : r;
    });
  });

export const getRecipeFn = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const looksUuid = /^[0-9a-f-]{36}$/i.test(data.id);
    const q = supabaseAdmin.from("recipes").select(ROW_COLS);
    const { data: row, error } = await (looksUuid ? q.eq("id", data.id) : q.eq("slug", data.id)).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { recipe: null, locked: false } as const;
    const recipe = rowToRecipe(row as Row);
    if (!recipe.premium) return { recipe, locked: false } as const;
    const entitled = await viewerIsEntitled();
    return entitled ? ({ recipe, locked: false } as const) : ({ recipe: publicShape(recipe), locked: true } as const);
  });

async function requireAdminUserId(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden: admin role required");
}

function toDbPayload(data: z.infer<typeof RecipeInput>) {
  return {
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
    prompt_ids: data.promptIds ?? [],
    category: data.category ?? null,
    source_year: data.sourceYear ?? null,
    source_url: data.sourceUrl ?? null,
    source_author: data.sourceAuthor ?? null,
  };
}

export const adminCreateRecipeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RecipeInput.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdminUserId(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("recipes")
      .insert({ ...toDbPayload(data), created_by: context.userId } as any)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const adminUpdateRecipeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), patch: RecipeInput.partial() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdminUserId(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: Record<string, unknown> = {};
    const p = data.patch;
    if (p.slug !== undefined) patch.slug = p.slug;
    if (p.title !== undefined) patch.title = p.title;
    if (p.image !== undefined) patch.image = p.image;
    if (p.scan !== undefined) patch.scan = p.scan;
    if (p.era !== undefined) patch.era = p.era;
    if (p.source !== undefined) patch.source = p.source;
    if (p.region !== undefined) patch.region = p.region;
    if (p.tag !== undefined) patch.tag = p.tag;
    if (p.premium !== undefined) patch.premium = p.premium;
    if (p.intro !== undefined) patch.intro = p.intro;
    if (p.originalLines !== undefined) patch.original_lines = p.originalLines;
    if (p.ingredients !== undefined) patch.ingredients = p.ingredients;
    if (p.method !== undefined) patch.method = p.method;
    if (p.promptIds !== undefined) patch.prompt_ids = p.promptIds;
    if (p.category !== undefined) patch.category = p.category;
    if (p.sourceYear !== undefined) patch.source_year = p.sourceYear;
    if (p.sourceUrl !== undefined) patch.source_url = p.sourceUrl;
    if (p.sourceAuthor !== undefined) patch.source_author = p.sourceAuthor;
    const { error } = await supabaseAdmin.from("recipes").update(patch as any).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteRecipeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdminUserId(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("recipes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
