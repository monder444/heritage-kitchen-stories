import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { recipes as seedRecipes, type Recipe } from "./recipes";

const KEY = "ca.recipes";

type Ctx = {
  all: Recipe[];
  userRecipes: Recipe[];
  get: (id: string) => Recipe | undefined;
  add: (r: Recipe) => void;
  remove: (id: string) => void;
};

const RecipeCtx = createContext<Ctx | null>(null);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUserRecipes(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(userRecipes)); } catch { /* noop */ }
  }, [userRecipes]);

  const all = useMemo(() => [...userRecipes, ...seedRecipes], [userRecipes]);
  const get = useCallback((id: string) => all.find((r) => r.id === id), [all]);
  const add = useCallback((r: Recipe) => setUserRecipes((cur) => [r, ...cur.filter((x) => x.id !== r.id)]), []);
  const remove = useCallback((id: string) => setUserRecipes((cur) => cur.filter((r) => r.id !== id)), []);

  return (
    <RecipeCtx.Provider value={{ all, userRecipes, get, add, remove }}>
      {children}
    </RecipeCtx.Provider>
  );
}

export function useRecipes() {
  const ctx = useContext(RecipeCtx);
  if (!ctx) throw new Error("useRecipes must be used inside RecipeProvider");
  return ctx;
}

// Mock generators that simulate URL scraping / OCR / AI formatting.
// All produce a Recipe matching the portal's schema and tone.

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

/** Wrap monolingual content into the bilingual Recipe shape (sk authored, en mirror). */
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

/** Mock "scrape + AI format" from a URL. */
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

/** Mock "OCR + AI format" from an uploaded image (data URL). */
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
