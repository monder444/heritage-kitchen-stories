import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { RecipeCard } from "@/components/site/RecipeCard";
import { useLang } from "@/lib/i18n";
import { magicPrompts } from "@/lib/recipes";
import { useRecipes } from "@/lib/recipe-store";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Objavovať recepty — Chuť Archívu" },
      { name: "description", content: "Hľadajte v zdigitalizovaných slovenských kuchárkach podľa éry, regiónu alebo ingrediencie." },
    ],
  }),
  component: Discover,
});

const eras = ["1842", "1870", "1914", "1924"];

function Discover() {
  const { lang } = useLang();
  const { all: recipes } = useRecipes();
  const [q, setQ] = useState("");
  const [era, setEra] = useState<string | null>(null);
  const [onlyFree, setOnlyFree] = useState(false);

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (era && r.era !== era) return false;
      if (onlyFree && r.premium) return false;
      if (q.trim()) {
        const s = q.toLowerCase();
        const hay = [r.title[lang], r.region[lang], r.tag[lang], r.intro[lang], r.source[lang]].join(" ").toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [q, era, onlyFree, lang, recipes]);

  return (
    <SiteShell>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-burnt mb-4">Archív</p>
        <h1 className="font-serif text-5xl md:text-6xl mb-6 leading-tight">Objavovať recepty</h1>
        <p className="text-lg text-muted-foreground max-w-xl mb-10">
          Prehľadávajte zdigitalizované kuchárky podľa éry, regiónu alebo ingrediencie. Každý recept odkazuje na pôvodný sken.
        </p>

        <div className="bg-card rounded-3xl border border-border p-6 md:p-8 shadow-sm mb-10">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Hľadať halušky, závin, divinu…"
            className="w-full px-5 py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-burnt/30 text-base"
          />
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mr-2">Éra</span>
            <button
              onClick={() => setEra(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                era === null ? "bg-burgundy text-cream border-burgundy" : "border-border hover:border-burnt"
              }`}
            >
              Všetky
            </button>
            {eras.map((e) => (
              <button
                key={e}
                onClick={() => setEra(e)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  era === e ? "bg-burgundy text-cream border-burgundy" : "border-border hover:border-burnt"
                }`}
              >
                {e}
              </button>
            ))}
            <span className="mx-2 h-5 w-px bg-border" />
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={onlyFree} onChange={(e) => setOnlyFree(e.target.checked)} className="accent-burgundy" />
              Iba voľne dostupné
            </label>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {magicPrompts.map((p) => (
            <button
              key={p.text.sk}
              onClick={() => setQ(p.text[lang].split(" ").slice(0, 2).join(" "))}
              className="text-left bg-parchment border border-border rounded-2xl p-5 hover:border-burnt transition-colors"
            >
              <p className="font-mono text-[10px] text-burnt uppercase tracking-[0.18em] mb-2">{p.label[lang]}</p>
              <p className="font-serif italic text-base">„{p.text[lang]}“</p>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "nález" : "nálezov"}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="font-serif text-2xl mb-2">Žiadny záznam v archíve.</p>
            <p className="text-sm">Skúste iný výraz alebo éru.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filtered.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
