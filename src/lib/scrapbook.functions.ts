import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listSavedFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("scrapbook")
      .select("recipe_id")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.recipe_id as string);
  });

export const toggleSavedFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { recipeId: string }) =>
    z.object({ recipeId: z.string().min(1).max(120) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("scrapbook")
      .select("recipe_id")
      .eq("user_id", context.userId)
      .eq("recipe_id", data.recipeId)
      .maybeSingle();

    if (existing) {
      const { error } = await context.supabase
        .from("scrapbook")
        .delete()
        .eq("user_id", context.userId)
        .eq("recipe_id", data.recipeId);
      if (error) throw new Error(error.message);
      return { saved: false as const };
    }

    const { error } = await context.supabase
      .from("scrapbook")
      .insert({ user_id: context.userId, recipe_id: data.recipeId });
    if (error) throw new Error(error.message);
    return { saved: true as const };
  });

/** Bulk import a guest's localStorage scrapbook after sign-in. */
export const mergeScrapbookFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { recipeIds: string[] }) =>
    z.object({ recipeIds: z.array(z.string().min(1).max(120)).max(500) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    if (data.recipeIds.length === 0) return { merged: 0 };
    const rows = data.recipeIds.map((recipe_id) => ({ user_id: context.userId, recipe_id }));
    const { error } = await context.supabase.from("scrapbook").upsert(rows, { onConflict: "user_id,recipe_id" });
    if (error) throw new Error(error.message);
    return { merged: rows.length };
  });
