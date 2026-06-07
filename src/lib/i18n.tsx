import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "sk" | "en";

type Dict = Record<string, { sk: string; en: string }>;

export const dict: Dict = {
  "nav.discover": { sk: "Objavovať", en: "Discover" },
  "nav.scrapbook": { sk: "Zápisník", en: "Scrapbook" },
  "nav.dossiers": { sk: "Kníhkupectvo", en: "Dossiers" },
  "nav.builder": { sk: "Zostaviť knihu", en: "Book Builder" },
  "nav.admin": { sk: "Admin", en: "Admin" },
  "nav.signin": { sk: "Prihlásiť sa", en: "Sign in" },

  "home.eyebrow": { sk: "Digitalizované dedičstvo", en: "Digitised heritage" },
  "home.title.1": { sk: "Oživte chute", en: "Revive the flavours" },
  "home.title.2": { sk: "starých prešporských", en: "of old Pressburg" },
  "home.title.3": { sk: "kuchýň.", en: "kitchens." },
  "home.lede": {
    sk: "Transformujeme zabudnuté rukopisy a archívne skeny do moderných receptov pomocou umelej inteligencie. Objavte gastronómiu našich predkov.",
    en: "We transform forgotten manuscripts and archive scans into modern recipes with the help of AI. Discover the gastronomy of our ancestors.",
  },
  "home.search.placeholder": {
    sk: "Hľadať „vianočné oblátky“ alebo „divina“…",
    en: "Search “Christmas wafers” or “game”…",
  },
  "home.tip.label": { sk: "Dnešný tip", en: "Today’s pick" },
  "home.tip.quote": {
    sk: "„Najlepšia torta s mandľami, ako ju piekla pani zemanová roku 1894…“",
    en: "“The finest almond cake, as Lady Zeman baked it in 1894…”",
  },

  "home.prompts.title": { sk: "Časostroj v kuchyni", en: "A time machine in the kitchen" },
  "home.prompts.sub": {
    sk: "Inšpirujte sa otázkami z archívu",
    en: "Get inspired by questions from the archive",
  },

  "home.viewer.title": { sk: "Authenticity Viewer™", en: "Authenticity Viewer™" },
  "home.viewer.sub": {
    sk: "Sledujte premenu historického skenu na čitateľný recept v reálnom čase — s prísnym zachovaním zdroja.",
    en: "Watch a historical scan transform into a readable recipe in real time — with strict source preservation.",
  },
  "home.viewer.demo": { sk: "Vyskúšať demo", en: "Try the demo" },
  "home.viewer.original": { sk: "Historický originál (1923)", en: "Historical original (1923)" },
  "home.viewer.ai": { sk: "AI Modernizácia", en: "AI modernisation" },
  "home.viewer.citation": { sk: "Citácia: Archív SNK, Fond 12", en: "Citation: SNK Archive, Fund 12" },
  "home.viewer.ingredients": { sk: "Suroviny", en: "Ingredients" },
  "home.viewer.method": { sk: "Postup", en: "Method" },
  "home.viewer.save": { sk: "Uložiť do môjho zápisníka", en: "Save to my scrapbook" },

  "home.scrap.title": { sk: "Váš digitálny zápisník", en: "Your digital scrapbook" },
  "home.scrap.tag": { sk: "Štítok", en: "Tag" },

  "home.builder.title": { sk: "Zostaviť knihu", en: "Build a book" },
  "home.builder.lede": {
    sk: "Máte 14 uložených receptov. Premeňte ich na profesionálne vytlačenú kuchárku.",
    en: "You have 14 saved recipes. Turn them into a professionally printed cookbook.",
  },
  "home.builder.cta": { sk: "Personalizovať PDF / Tlač", en: "Personalise PDF / Print" },
  "home.builder.price": { sk: "Od 29,00 € vrátane poštovného", en: "From €29.00 incl. shipping" },

  "common.source": { sk: "Zdroj", en: "Source" },
  "common.free": { sk: "Voľne", en: "Free" },
  "common.premium": { sk: "Premium", en: "Premium" },
  "common.open": { sk: "Otvoriť", en: "Open" },
  "common.save": { sk: "Uložiť", en: "Save" },
  "common.saved": { sk: "Uložené", en: "Saved" },
  "common.remove": { sk: "Odstrániť", en: "Remove" },
  "common.continue": { sk: "Pokračovať", en: "Continue" },

  "footer.tag": { sk: "© 2026 Chuť Archívu — historický kulinársky portál.", en: "© 2026 Chuť Archívu — historical culinary portal." },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: keyof typeof dict) => string };
const LangCtx = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("sk");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ca.lang") as Lang | null;
      if (saved === "sk" || saved === "en") setLang(saved);
    } catch { /* noop */ }
  }, []);
  const update = (l: Lang) => {
    setLang(l);
    try { localStorage.setItem("ca.lang", l); } catch { /* noop */ }
  };
  const t = (k: keyof typeof dict) => dict[k]?.[lang] ?? String(k);
  return <LangCtx.Provider value={{ lang, setLang: update, t }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
