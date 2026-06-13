import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteShell } from "@/components/site/SiteShell";
import { RecipeCard } from "@/components/site/RecipeCard";
import { useLang } from "@/lib/i18n";
import { listRecipesFn } from "@/lib/recipes.functions";
import { recipes as seedRecipes } from "@/lib/recipes";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Hľadať v archíve — Chuť Archívu" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
    free: s.free === "1" || s.free === true,
  }),
  component: SearchPage,
});

function SearchPage() {
  const { lang } = useLang();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(search.q ?? "");
  const [freeOnly, setFreeOnly] = useState(!!search.free);
  const [era, setEra] = useState<string | null>(null);

  const listRecipes = useServerFn(listRecipesFn);
  const recipesQ = useQuery({ queryKey: ["recipes", "all"], queryFn: () => listRecipes(), staleTime: 30_000 });
  const all = useMemo(() => {
    const db = recipesQ.data ?? [];
    return db.length > 0 ? db : seedRecipes;
  }, [recipesQ.data]);

  const allEras = useMemo(() => Array.from(new Set(all.map((r) => r.era).filter(Boolean))).sort(), [all]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((r) => {
      if (freeOnly && r.premium) return false;
      if (era && r.era !== era) return false;
      if (!needle) return true;
      const haystack = [
        r.title.sk, r.title.en, r.era, r.category ?? "", r.region.sk, r.region.en,
        r.source.sk, r.source.en, r.sourceAuthor ?? "",
        ...(r.ingredients.sk ?? []), ...(r.ingredients.en ?? []),
        ...(r.originalLines.sk ?? []), ...(r.originalLines.en ?? []),
      ].join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [all, q, era, freeOnly]);

  return (
    <SiteShell>
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-burnt mb-3">{lang === "sk" ? "Vyhľadávanie" : "Search"}</p>
        <h1 className="font-serif text-5xl mb-8 text-burgundy">{lang === "sk" ? "Hľadajte v archíve" : "Search the archive"}</h1>

        <form
          onSubmit={(e) => { e.preventDefault(); navigate({ search: { q, free: freeOnly ? true : false }, replace: true }); }}
          className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-5"
        >
          <div className="flex gap-3">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={lang === "sk" ? "Recept, surovina, región, rok…" : "Recipe, ingredient, region, year…"}
              className="flex-1 px-5 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-burnt/30 text-base"
            />
            <button type="submit" className="px-6 py-3 bg-burgundy text-cream rounded-xl text-sm font-semibold hover:bg-ink">
              {lang === "sk" ? "Hľadať" : "Search"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mr-2">{lang === "sk" ? "Éra" : "Era"}:</span>
            <button type="button" onClick={() => setEra(null)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${era === null ? "bg-burgundy text-cream border-burgundy" : "border-border hover:border-burnt"}`}>
              {lang === "sk" ? "Všetky" : "All"}
            </button>
            {allEras.map((e) => (
              <button key={e} type="button" onClick={() => setEra(e === era ? null : e)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${era === e ? "bg-burgundy text-cream border-burgundy" : "border-border hover:border-burnt"}`}>
                {e}
              </button>
            ))}
          </div>

          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} className="accent-burgundy" />
            {lang === "sk" ? "Iba voľne dostupné" : "Free only"}
          </label>
        </form>

        <div className="mt-10">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground mb-6">
            {results.length} {lang === "sk" ? "výsledkov" : "results"}
          </p>
          {results.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-serif text-2xl text-burgundy italic mb-2">{lang === "sk" ? "Žiadne nálezy" : "No matches"}</p>
              <p className="text-sm text-muted-foreground">{lang === "sk" ? "Skúste iné kľúčové slovo alebo uvoľnite filtre." : "Try another keyword or relax the filters."}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((r) => <RecipeCard key={r.id} recipe={r} />)}
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
