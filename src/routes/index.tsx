import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteShell } from "@/components/site/SiteShell";
import { RecipeCard } from "@/components/site/RecipeCard";
import { useLang } from "@/lib/i18n";
import { recipes as seedRecipes } from "@/lib/recipes";
import { listPromptsFn } from "@/lib/prompts.functions";
import { listRecipesFn } from "@/lib/recipes.functions";
import heroImg from "@/assets/hero-cookbook.jpg";
import scanImg from "@/assets/scan-page.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chuť Archívu — Historický kulinársky archív" },
      { name: "description", content: "Slovenský portál pre objavovanie autentických historických receptov. Každý recept odkazuje na pôvodný archívny prameň." },
      { property: "og:title", content: "Chuť Archívu — Historický kulinársky archív" },
      { property: "og:description", content: "Curated Slovak culinary archive: scans, original text, modern transcription. Strict source citation on every recipe." },
    ],
  }),
  component: Home,
});

const ICON_FALLBACKS: Record<string, string> = {
  cake: "🍰", icecream: "🍨", soup_kitchen: "🥣", restaurant: "🍖",
  bakery_dining: "🍞", local_bar: "🍷", celebration: "🎄", menu_book: "📖",
};

function Home() {
  const { lang, t } = useLang();
  const listPrompts = useServerFn(listPromptsFn);
  const listRecipes = useServerFn(listRecipesFn);
  const promptsQ = useQuery({ queryKey: ["prompts", "all"], queryFn: () => listPrompts(), staleTime: 60_000 });
  const recipesQ = useQuery({ queryKey: ["recipes", "all"], queryFn: () => listRecipes(), staleTime: 30_000 });

  const dbRecipes = recipesQ.data ?? [];
  const allRecipes = dbRecipes.length > 0 ? dbRecipes : seedRecipes;
  const prompts = promptsQ.data ?? [];
  const sample = allRecipes.find((r) => !r.premium) ?? allRecipes[0] ?? seedRecipes[0];
  const latest = allRecipes.slice(0, 4);

  // Group recipes by century for Time Capsule
  const byEra = allRecipes.reduce<Record<string, typeof allRecipes>>((acc, r) => {
    const year = parseInt(r.era, 10) || 1900;
    const century = `${Math.floor(year / 100) + 1}. storočie`;
    (acc[century] ??= []).push(r);
    return acc;
  }, {});
  const eras = Object.keys(byEra).sort();

  return (
    <SiteShell>
      {/* 1 · HERO */}
      <header className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <span className="inline-block px-4 py-1.5 bg-burnt/10 text-burnt rounded-full text-xs font-bold uppercase tracking-[0.18em]">
            {t("home.eyebrow")}
          </span>
          <h1 className="text-5xl md:text-7xl font-serif leading-[1.05] text-pretty">
            {t("home.title.1")} <span className="italic text-burgundy">{t("home.title.2")}</span> {t("home.title.3")}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-md">{t("home.lede")}</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/search" className="inline-flex items-center px-6 py-3 bg-burgundy text-cream rounded-full text-sm font-semibold hover:bg-ink transition-colors">
              {lang === "sk" ? "Hľadať v archíve →" : "Search the archive →"}
            </Link>
            <a href="#prompts" className="inline-flex items-center px-6 py-3 border border-border rounded-full text-sm font-semibold hover:border-burnt transition-colors">
              {lang === "sk" ? "Magické témy" : "Magic topics"}
            </a>
          </div>
        </div>
        <div className="relative">
          <img src={heroImg} alt="Otvorená historická slovenská kuchárka s rukou písanými poznámkami" width={1200} height={1400} className="w-full aspect-[4/5] object-cover rounded-3xl shadow-2xl ring-1 ring-black/5" />
          <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-2xl shadow-xl max-w-xs border border-border">
            <p className="text-[10px] font-bold text-burnt uppercase tracking-[0.18em] mb-2">{t("home.tip.label")}</p>
            <p className="font-serif italic text-lg text-foreground leading-snug">{t("home.tip.quote")}</p>
          </div>
        </div>
      </header>

      {/* 2 · MAGIC PROMPTS GRID */}
      <section id="prompts" className="bg-parchment py-20 border-y border-border paper-texture">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-burnt mb-2">{lang === "sk" ? "Magické témy" : "Magic topics"}</p>
              <h2 className="font-serif text-4xl md:text-5xl mb-2">{lang === "sk" ? "Vyberte si dvere do archívu" : "Pick a door into the archive"}</h2>
              <p className="text-muted-foreground text-sm max-w-md">{lang === "sk" ? "Každá téma je kurátorská zbierka receptov, prepojená s pôvodnými archívnymi zápismi." : "Each topic is a curated set of recipes, linked to original archival entries."}</p>
            </div>
          </div>
          {promptsQ.isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-44 rounded-3xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : prompts.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">{lang === "sk" ? "Témy zatiaľ neboli pridané." : "No topics yet."}</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {prompts.map((p) => (
                <Link
                  to="/explore/$promptSlug"
                  params={{ promptSlug: p.slug }}
                  key={p.id}
                  className="group bg-card p-7 rounded-3xl border border-border hover:border-burnt hover:shadow-lg transition-all flex flex-col"
                >
                  <span className="text-3xl mb-4" aria-hidden>{ICON_FALLBACKS[p.icon] ?? "📖"}</span>
                  <h3 className="font-serif text-xl leading-snug mb-2 text-burgundy">{p.title[lang]}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{p.description[lang]}</p>
                  <div className="mt-5 w-8 h-px bg-border group-hover:w-20 group-hover:bg-burnt transition-all" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3 · TIME CAPSULE — horizontal era scroll */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-burnt mb-2">{lang === "sk" ? "Časová kapsula" : "Time capsule"}</p>
            <h2 className="font-serif text-4xl">{lang === "sk" ? "Po storočiach" : "Through the centuries"}</h2>
          </div>
        </div>
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-8 px-6 max-w-7xl mx-auto min-w-min">
            {eras.length === 0 ? (
              <p className="text-muted-foreground">{lang === "sk" ? "Zatiaľ žiadne recepty." : "No recipes yet."}</p>
            ) : (
              eras.map((era) => (
                <div key={era} className="shrink-0 w-80">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-burnt mb-3">{era}</p>
                  <div className="space-y-3">
                    {byEra[era].slice(0, 3).map((r) => (
                      <Link key={r.id} to="/viewer/$id" params={{ id: r.id }} className="flex gap-3 p-3 bg-card border border-border rounded-2xl hover:border-burnt transition-colors">
                        <img src={r.image} alt="" className="size-16 object-cover rounded-lg shrink-0" loading="lazy" />
                        <div className="min-w-0">
                          <p className="font-serif text-base truncate text-burgundy">{r.title[lang]}</p>
                          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mt-1 truncate">{r.region[lang]} · {r.era}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4 · VIEWER TEASER */}
      <section className="bg-ink py-20 md:py-24 text-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-burnt mb-2">Authenticity Viewer</p>
              <h2 className="text-4xl font-serif mb-4">{t("home.viewer.title")}</h2>
              <p className="text-cream/60 max-w-md leading-relaxed">{t("home.viewer.sub")}</p>
            </div>
            <Link to="/viewer/$id" params={{ id: sample.id }} className="text-burnt font-medium border-b border-burnt pb-1 hover:text-cream hover:border-cream transition-colors">
              {t("home.viewer.demo")} →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-cream/10 border border-cream/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-parchment p-8 flex flex-col items-center justify-center min-h-[480px] relative">
              <div className="absolute top-6 left-6 px-3 py-1 bg-ink/10 rounded text-[10px] font-bold text-ink-soft uppercase tracking-[0.18em]">
                {t("home.viewer.original")}
              </div>
              <img src={sample.scan || scanImg} alt="Sken historickej strany" loading="lazy" className="w-3/4 aspect-[3/4] object-cover shadow-inner border border-border rounded-sm" />
            </div>
            <div className="bg-cream p-10 md:p-12 text-foreground flex flex-col">
              <div className="flex justify-between items-start mb-8 gap-4">
                <div className="px-3 py-1 bg-burgundy/10 rounded text-[10px] font-bold text-burgundy uppercase tracking-[0.18em]">{t("home.viewer.ai")}</div>
                <span className="text-[10px] text-muted-foreground underline underline-offset-4 text-right">{sample.source[lang]}</span>
              </div>
              <h3 className="text-3xl font-serif mb-6">{sample.title[lang]}</h3>
              <div className="space-y-6 flex-1">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-burnt">{t("home.viewer.ingredients")}</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {(sample.ingredients[lang].length ? sample.ingredients[lang] : ["—"]).slice(0, 3).map((i, idx) => <li key={`${i}-${idx}`}>• {i}</li>)}
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-burnt">{t("home.viewer.method")}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">{sample.originalLines[lang][0] ?? "—"}</p>
                </div>
              </div>
              <Link to="/viewer/$id" params={{ id: sample.id }} className="mt-10 w-full py-4 bg-ink text-cream rounded-xl font-medium hover:bg-burnt transition-colors text-center">
                {t("home.viewer.save")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5 · TIMELINE EXPLORER (era pills) */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-burnt mb-2">{lang === "sk" ? "Časová os" : "Timeline"}</p>
        <h2 className="font-serif text-4xl mb-8">{lang === "sk" ? "Prejdite archívom po éřách" : "Walk through the eras"}</h2>
        <div className="flex flex-wrap gap-3">
          {Array.from(new Set(allRecipes.map((r) => r.era))).sort().map((era) => (
            <Link key={era} to="/search" search={{ q: era } as never} className="px-5 py-2.5 bg-card border border-border rounded-full text-sm font-semibold hover:border-burnt hover:text-burgundy transition-colors">
              {era}
            </Link>
          ))}
        </div>
      </section>

      {/* 6 · LATEST FINDS */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
          <h2 className="font-serif text-4xl">{lang === "sk" ? "Posledné nálezy" : "Latest finds"}</h2>
          <Link to="/search" className="text-sm font-bold border-b-2 border-burgundy pb-1 hover:text-burnt hover:border-burnt">
            {lang === "sk" ? "Zobraziť archív" : "Browse archive"} →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {latest.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      </section>

      {/* 7 · SCRAPBOOK / BOOK BUILDER TEASER */}
      <section className="max-w-7xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-card rounded-3xl p-10 border border-border">
          <h3 className="font-serif text-3xl mb-4 text-burgundy">{t("home.scrap.title")}</h3>
          <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
            {lang === "sk" ? "Uložte si recepty, pridajte vlastné poznámky a štítky. Všetko ostáva odkázané na pôvodný prameň." : "Save recipes, add your own notes and tags. Every entry stays tied to its original source."}
          </p>
          <Link to="/scrapbook" className="inline-flex items-center gap-2 text-burgundy font-semibold border-b border-burgundy/40 hover:border-burgundy">
            {lang === "sk" ? "Otvoriť zápisník" : "Open scrapbook"} →
          </Link>
        </div>
        <Link to="/book-builder" className="bg-parchment rounded-3xl p-8 border border-border hover:border-burnt transition-all group">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 bg-burgundy rounded-full grid place-items-center text-cream font-serif">B</div>
            <h4 className="font-serif text-xl text-burgundy">{t("home.builder.title")}</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{t("home.builder.lede")}</p>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-burnt group-hover:underline">{t("home.builder.cta")} →</span>
          <p className="text-[10px] mt-4 text-muted-foreground uppercase tracking-[0.2em]">{t("home.builder.price")}</p>
        </Link>
      </section>
    </SiteShell>
  );
}
