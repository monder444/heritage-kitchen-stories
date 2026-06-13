import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MagicPrompt = {
  id: string;
  slug: string;
  title: { sk: string; en: string };
  description: { sk: string; en: string };
  icon: string;
  category: string | null;
  display_order: number;
};

const Bi = z.object({ sk: z.string().default(""), en: z.string().default("") });

const PromptInput = z.object({
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/, "len malé písmená, číslice a pomlčky"),
  title: Bi,
  description: Bi.optional(),
  icon: z.string().min(1).max(40).default("menu_book"),
  category: z.string().max(60).optional().nullable(),
  display_order: z.number().int().min(0).max(9999).default(0),
});

function rowToPrompt(r: any): MagicPrompt {
  return {
    id: r.id,
    slug: r.slug,
    title: (r.title as { sk?: string; en?: string }) ?? { sk: "", en: "" },
    description: (r.description as { sk?: string; en?: string }) ?? { sk: "", en: "" },
    icon: r.icon ?? "menu_book",
    category: r.category ?? null,
    display_order: r.display_order ?? 0,
  } as MagicPrompt;
}

async function requireAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden: admin role required");
}

export const listPromptsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("magic_prompts")
    .select("id,slug,title,description,icon,category,display_order")
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToPrompt);
});

export const getPromptBySlugFn = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("magic_prompts")
      .select("id,slug,title,description,icon,category,display_order")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? rowToPrompt(row) : null;
  });

export const getPromptByIdFn = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("magic_prompts")
      .select("id,slug,title,description,icon,category,display_order")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? rowToPrompt(row) : null;
  });

export const adminCreatePromptFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PromptInput.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("magic_prompts")
      .insert({
        slug: data.slug,
        title: data.title,
        description: data.description ?? { sk: "", en: "" },
        icon: data.icon,
        category: data.category ?? null,
        display_order: data.display_order,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const adminUpdatePromptFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), patch: PromptInput.partial() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("magic_prompts").update(data.patch as any).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeletePromptFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("magic_prompts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
