import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyRolesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    const roles = (data ?? []).map((r) => r.role as "admin" | "premium" | "user");
    return {
      userId: context.userId,
      roles,
      isAdmin: roles.includes("admin"),
      isPremium: roles.includes("admin") || roles.includes("premium"),
    };
  });

/** Stub: in real life this would create a Stripe Checkout Session. */
export const grantPremiumStubFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: context.userId, role: "premium" }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
