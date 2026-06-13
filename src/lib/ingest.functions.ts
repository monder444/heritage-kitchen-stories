import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Mock OCR — returns deterministic placeholder text. Real Groq/Lovable AI wiring deferred per user's "Mock for now" choice. */
export const ocrFromUrlFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { imageUrl: string }) =>
    z.object({ imageUrl: z.string().url().max(2048) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: role } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (!role) throw new Error("Forbidden: admin role required");
    // Stub: synthesise plausible Slovak archival text.
    await new Promise((r) => setTimeout(r, 700));
    return {
      text:
        `„Vezmi múky pšeničnej tri šálky a masla pol funta, zarob do toho štyri žĺtky a štipku soli. ` +
        `Cesto nechaj odpočinúť na chladnom mieste hodinu, potom rozvaľkaj a peč v stredne teplej rúre, ` +
        `kým sa nevytvorí zlatistá kôrka.“\n\n— rozpoznané (demo OCR) zo ${data.imageUrl}`,
      provider: "mock",
    };
  });

/** Mock URL import — extracts host + slug into placeholder structured fields. */
export const importFromUrlFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { url: string }) => z.object({ url: z.string().url().max(2048) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: role } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (!role) throw new Error("Forbidden: admin role required");
    await new Promise((r) => setTimeout(r, 600));
    let host = "zdroj.sk";
    let titleGuess = "Recept z webu";
    try {
      const u = new URL(data.url);
      host = u.hostname.replace(/^www\./, "");
      const last = u.pathname.split("/").filter(Boolean).pop();
      if (last) titleGuess = decodeURIComponent(last).replace(/[-_]+/g, " ").replace(/\.[a-z]+$/, "");
    } catch { /* noop */ }
    titleGuess = titleGuess.charAt(0).toUpperCase() + titleGuess.slice(1);
    return {
      provider: "mock",
      data: {
        title_sk: titleGuess,
        title_en: titleGuess,
        category: "pečenie",
        era: String(new Date().getFullYear()),
        source_title: host,
        source_author: "",
        source_year: new Date().getFullYear(),
        source_url: data.url,
        original_text_sk: `Pôvodný web: ${data.url}\nText automaticky importovaný — pred publikovaním overte.`,
        ingredients_sk: ["Surovina 1 (auto)", "Surovina 2 (auto)", "Surovina 3 (auto)"],
        steps_sk: ["Krok 1 z importovaného postupu.", "Krok 2 z importovaného postupu."],
        steps_en: ["Step 1 from imported method.", "Step 2 from imported method."],
      },
    };
  });

/** Mock modernization note for the viewer — 2-3 sentences in current Slovak/English. */
export const modernizeContextFn = createServerFn({ method: "POST" })
  .inputValidator((d: { title: string; era?: string; lang?: "sk" | "en" }) =>
    z.object({ title: z.string().min(1).max(200), era: z.string().max(80).optional(), lang: z.enum(["sk", "en"]).default("sk") }).parse(d),
  )
  .handler(async ({ data }) => {
    await new Promise((r) => setTimeout(r, 400));
    const era = data.era || "19. storočie";
    const sk =
      `${data.title} pochádza z obdobia ${era}. V dnešnej kuchyni môžete pôvodné jednotky (libry, žajdle) nahradiť modernými gramami a mililitrami. ` +
      `Náročnosť hodnotíme ako stredne ťažkú — kľúčové je dodržať pôvodný pomer surovín a čas pečenia.`;
    const en =
      `${data.title} dates from ${era}. In a modern kitchen, swap the original units (pounds, gills) for grams and millilitres. ` +
      `We rate the difficulty as intermediate — the key is to keep the original ingredient ratio and baking time.`;
    return { text: data.lang === "en" ? en : sk, provider: "mock" };
  });
