import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { recipes as seedRecipes, type Recipe } from "./recipes";
import { adminCreateRecipeFn, adminDeleteRecipeFn, listRecipesFn } from "./recipes.functions";

type Ctx = {
  all: Recipe[];
  userRecipes: Recipe[];
  get: (id: string) => Recipe | undefined;
  add: (r: Recipe) => Promise<string | null>;
  remove: (id: string) => Promise<void>;
  isLoading: boolean;
};

const RecipeCtx = createContext<Ctx | null>(null);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const listRecipes = useServerFn(listRecipesFn);
  const adminCreate = useServerFn(adminCreateRecipeFn);
  const adminDelete = useServerFn(adminDeleteRecipeFn);

  const q = useQuery({
    queryKey: ["recipes", "all"],
    queryFn: () => listRecipes(),
    staleTime: 30_000,
  });

  const userRecipes = q.data ?? [];
  const all = useMemo(() => [...userRecipes, ...seedRecipes], [userRecipes]);
  const get = useCallback((id: string) => all.find((r) => r.id === id), [all]);

  const createMut = useMutation({
    mutationFn: (r: Recipe) =>
      adminCreate({
        data: {
          slug: r.id,
          title: r.title,
          image: r.image,
          scan: r.scan,
          era: r.era,
          source: r.source,
          region: r.region,
          tag: r.tag,
          premium: r.premium,
          intro: r.intro,
          originalLines: r.originalLines,
          ingredients: r.ingredients,
          method: r.method,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recipes"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminDelete({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recipes"] }),
  });

  const add = useCallback(async (r: Recipe): Promise<string | null> => {
    try {
      const { id } = await createMut.mutateAsync(r);
      return id;
    } catch (e: any) {
      toast.error(e?.message || "Recept sa nepodarilo uložiť");
      return null;
    }
  }, [createMut]);

  const remove = useCallback(async (id: string) => {
    // Seed ids aren't UUIDs — skip server delete for static seed.
    const looksUuid = /^[0-9a-f-]{36}$/i.test(id);
    if (!looksUuid) {
      toast.message("Tento recept je v základnom obsahu portálu a nie je možné ho odstrániť.");
      return;
    }
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Recept zmazaný");
    } catch (e: any) {
      toast.error(e?.message || "Nepodarilo sa zmazať");
    }
  }, [deleteMut]);

  return (
    <RecipeCtx.Provider value={{ all, userRecipes, get, add, remove, isLoading: q.isLoading }}>
      {children}
    </RecipeCtx.Provider>
  );
}

export function useRecipes() {
  const ctx = useContext(RecipeCtx);
  if (!ctx) throw new Error("useRecipes must be used inside RecipeProvider");
  return ctx;
}

/* ---------- mock generators (unchanged client-side helpers) ---------- */

const FALLBACK_IMG = "https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=1200&q=80";
const FALLBACK_SCAN = "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200&q=80";

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);
}

export function newId(title: string) {
  return `${slugify(title) || "recept"}-${Date.now().toString(36).slice(-4)}`;
}

type GenInput = {
  title: string;
  era?: string;
  region?: string;
  source?: string;
  intro?: string;
  ingredientsText?: string;
  methodText?: string;
  originalText?: string;
  image?: string;
  scan?: string;
  premium: boolean;
  tag?: string;
};

function toLines(text?: string): string[] {
  if (!text) return [];
  return text.split(/\r?\n|•|·|;/).map((s) => s.trim()).filter(Boolean);
}

export function buildRecipe(input: GenInput): Recipe {
  const title = input.title.trim() || "Nový recept z archívu";
  const ingredients = toLines(input.ingredientsText);
  const method = toLines(input.methodText);
  const original = toLines(input.originalText);
  const era = (input.era || "1900").trim();
  const region = (input.region || "Slovensko").trim();
  const source = (input.source || "Súkromný archív, prepis admina").trim();
  const intro = (input.intro || `Recept ${title.toLowerCase()} z roku ${era}, zachovaný v digitálnom archíve.`).trim();
  const tag = (input.tag || "Archívne novinky").trim();

  return {
    id: newId(title),
    title: { sk: title, en: title },
    image: input.image || FALLBACK_IMG,
    scan: input.scan || input.image || FALLBACK_SCAN,
    era,
    source: { sk: source, en: source },
    region: { sk: region, en: region },
    tag: { sk: tag, en: tag },
    premium: input.premium,
    intro: { sk: intro, en: intro },
    originalLines: {
      sk: original.length ? original : [`„Pôvodný zápis z roku ${era}, prepísaný cez OCR pipeline portálu.“`],
      en: original.length ? original : [`“Original entry from ${era}, transcribed via the portal's OCR pipeline.”`],
    },
    ingredients: {
      sk: ingredients.length ? ingredients : ["Suroviny budú doplnené po manuálnom prepise."],
      en: ingredients.length ? ingredients : ["Ingredients to be added after manual transcription."],
    },
    method: {
      sk: method.length ? method : ["Postup bude doplnený po manuálnom prepise."],
      en: method.length ? method : ["Method to be added after manual transcription."],
    },
  };
}

export function generateFromUrl(url: string, premium: boolean): Recipe {
  let host = "zdroj.sk";
  let pathTitle = "Recept z webu";
  try {
    const u = new URL(url);
    host = u.hostname.replace(/^www\./, "");
    const last = u.pathname.split("/").filter(Boolean).pop();
    if (last) pathTitle = decodeURIComponent(last).replace(/[-_]+/g, " ").replace(/\.[a-z]+$/, "");
  } catch { /* noop */ }
  const title = pathTitle.charAt(0).toUpperCase() + pathTitle.slice(1);
  return buildRecipe({
    title,
    era: "2024",
    region: "Web",
    source: `${host} (auto-import)`,
    intro: `Recept automaticky importovaný z ${host} a preformátovaný do štýlu Chuť Archívu.`,
    originalText: `Pôvodný zdroj: ${url}`,
    ingredientsText: "Suroviny boli rozpoznané z webu — prosím, skontrolujte a upravte.",
    methodText: "Postup bol vygenerovaný z článku — prosím, skontrolujte a upravte.",
    premium,
    tag: "Web import",
  });
}

export function generateFromImage(opts: {
  imageDataUrl: string;
  title: string;
  era?: string;
  region?: string;
  source?: string;
  keepOriginal: boolean;
  premium: boolean;
}): Recipe {
  return buildRecipe({
    title: opts.title || "Recept zo skenu",
    era: opts.era || "1900",
    region: opts.region || "Neznámy región",
    source: opts.source || "Mobilný upload — admin",
    intro: "Recept rozpoznaný cez OCR pipeline z nahranej fotografie. Pred publikovaním overte presnosť.",
    originalText: "Text z OCR sa zobrazí tu po manuálnej kontrole.",
    ingredientsText: "Surovina A\nSurovina B\nSurovina C",
    methodText: "Krok 1 z postupu.\nKrok 2 z postupu.",
    image: opts.imageDataUrl,
    scan: opts.keepOriginal ? opts.imageDataUrl : undefined,
    premium: opts.premium,
    tag: "OCR import",
  });
}
