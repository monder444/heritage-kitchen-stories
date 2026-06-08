import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { useLang } from "@/lib/i18n";
import { useScrapbook } from "@/lib/scrapbook";
import { useRecipes } from "@/lib/recipe-store";

export const Route = createFileRoute("/viewer/$id")({
  head: () => ({ meta: [{ title: "Recept — Chuť Archívu" }] }),
  component: ViewerPage,
});

function ViewerPage() {
  const { id } = Route.useParams();
  const { get } = useRecipes();
  const recipe = get(id);
  const { lang, t } = useLang();
  const { has, toggle } = useScrapbook();
  const [unlocked, setUnlocked] = useState(!recipe?.premium);

  if (!recipe) {
    return (
      <SiteShell>
        <div className="max-w-2xl mx-auto py-32 text-center px-6">
          <h1 className="font-serif text-5xl text-burgundy mb-4">Recept sa nenašiel</h1>
          <Link to="/discover" className="text-burnt underline">Späť do archívu</Link>
        </div>
      </SiteShell>
    );
  }

  const saved = has(recipe.id);

  return (
    <SiteShell>
      <article className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <Link to="/discover" className="text-xs font-bold uppercase tracking-[0.18em] text-burnt mb-6 inline-block hover:underline">
          ← {t("nav.discover")}
        </Link>

        <header className="grid md:grid-cols-3 gap-8 mb-12 items-end">
          <div className="md:col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
              {recipe.region[lang]} · {recipe.era}
            </p>
            <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] text-foreground mb-4">
              {recipe.title[lang]}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">{recipe.intro[lang]}</p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3">
            <span className={`text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full ${recipe.premium ? "bg-burgundy text-cream" : "bg-burnt/10 text-burnt"}`}>
              {recipe.premium ? t("common.premium") : t("common.free")}
            </span>
            <button
              onClick={() => toggle(recipe.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                saved ? "bg-burgundy text-cream border-burgundy" : "border-border hover:border-burnt"
              }`}
            >
              {saved ? `✓ ${t("common.saved")}` : `+ ${t("common.save")}`}
            </button>
          </div>
        </header>

        {/* Split-screen viewer */}
        <div className="grid md:grid-cols-2 gap-px bg-border rounded-3xl overflow-hidden ring-1 ring-border shadow-2xl">
          {/* Original scan */}
          <div className="bg-parchment p-8 md:p-10 paper-texture">
            <div className="flex justify-between items-center mb-6">
              <span className="px-3 py-1 bg-ink/10 rounded text-[10px] font-bold text-ink-soft uppercase tracking-[0.18em]">
                {t("home.viewer.original")} · {recipe.era}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">100% facsimile</span>
            </div>
            <img
              src={recipe.scan}
              alt="Pôvodný sken historickej strany"
              loading="lazy"
              className="w-full rounded-lg shadow-inner border border-border"
            />
            <div className="mt-6 space-y-3 font-serif italic text-foreground/80 leading-relaxed">
              {recipe.originalLines[lang].map((line: string) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <p className="mt-8 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground border-t border-border pt-4">
              {t("common.source")}: {recipe.source[lang]}
            </p>
          </div>

          {/* AI modernised */}
          <div className="bg-card p-8 md:p-10 relative">
            <div className="flex justify-between items-center mb-6">
              <span className="px-3 py-1 bg-burgundy/10 rounded text-[10px] font-bold text-burgundy uppercase tracking-[0.18em]">
                {t("home.viewer.ai")} · RAG v2
              </span>
              <span className="px-2 py-1 border border-burnt/40 text-burnt text-[10px] rounded-full font-bold">
                98% autenticita
              </span>
            </div>

            <img
              src={recipe.image}
              alt={recipe.title[lang]}
              loading="lazy"
              className="w-full aspect-[16/10] object-cover rounded-xl mb-6"
            />

            {unlocked ? (
              <>
                <section className="mb-6">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-burnt mb-3">
                    {t("home.viewer.ingredients")}
                  </h2>
                  <ul className="space-y-2 text-sm">
                    {recipe.ingredients[lang].map((i: string, idx: number) => (
                      <li key={i} className="flex gap-3">
                        <span className="font-mono text-burnt text-xs pt-0.5">0{idx + 1}</span>
                        <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-burnt mb-3">
                    {t("home.viewer.method")}
                  </h2>
                  <ol className="space-y-3 text-sm leading-relaxed">
                    {recipe.method[lang].map((m: string, idx: number) => (
                      <li key={m} className="flex gap-3">
                        <span className="font-serif italic text-burgundy text-lg leading-none">{idx + 1}.</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              </>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-burgundy/30 bg-parchment p-8 text-center">
                <p className="font-serif text-2xl text-burgundy mb-3 italic">Tento recept je prémiový</p>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  Pre prístup k modernizácii a postupu sa prihláste alebo si aktivujte mesačné členstvo.
                </p>
                <button
                  onClick={() => setUnlocked(true)}
                  className="px-6 py-3 bg-burgundy text-cream rounded-full font-medium hover:bg-ink transition-colors"
                >
                  Odomknúť — 4,90 € / mesiac
                </button>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-4">
                  Zrušiť môžete kedykoľvek
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Citation footer */}
        <aside className="mt-10 bg-ink text-cream rounded-3xl p-8 md:p-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-burnt mb-3">Záväzok autenticity</p>
          <p className="font-serif text-2xl italic max-w-3xl leading-snug">
            „Negenerujeme syntetické recepty. Každý výstup je viazaný na konkrétnu archívnu stranu a jej skenovaný originál.“
          </p>
          <p className="mt-6 text-xs text-cream/60 font-mono uppercase tracking-[0.18em]">
            {t("common.source")}: {recipe.source[lang]}
          </p>
        </aside>
      </article>
    </SiteShell>
  );
}
