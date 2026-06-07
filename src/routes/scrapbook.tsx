import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { RecipeCard } from "@/components/site/RecipeCard";
import { useLang } from "@/lib/i18n";
import { useScrapbook } from "@/lib/scrapbook";
import { recipes } from "@/lib/recipes";

export const Route = createFileRoute("/scrapbook")({
  head: () => ({
    meta: [{ title: "Môj zápisník — Chuť Archívu" }, { name: "description", content: "Vaše uložené recepty a poznámky." }],
  }),
  component: ScrapbookPage,
});

function ScrapbookPage() {
  const { lang } = useLang();
  const { saved, clear } = useScrapbook();
  const items = recipes.filter((r) => saved.includes(r.id));

  return (
    <SiteShell>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-burnt mb-4">Vaša zbierka</p>
        <div className="flex justify-between items-end flex-wrap gap-4 mb-12">
          <h1 className="font-serif text-5xl md:text-6xl leading-tight">Digitálny zápisník</h1>
          {items.length > 0 && (
            <div className="flex gap-3">
              <Link
                to="/book-builder"
                className="px-5 py-2.5 bg-burgundy text-cream rounded-full text-sm font-medium hover:bg-ink"
              >
                Zostaviť knihu z {items.length} receptov →
              </Link>
              <button onClick={clear} className="px-5 py-2.5 border border-border rounded-full text-sm font-medium hover:border-burnt">
                Vyprázdniť
              </button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-parchment border border-border rounded-3xl p-16 text-center paper-texture">
            <p className="font-serif text-3xl italic text-burgundy mb-3">Váš zápisník je prázdny.</p>
            <p className="text-muted-foreground mb-8">Začnite objavovaním archívu a uložte si recepty na neskôr.</p>
            <Link to="/discover" className="inline-block px-6 py-3 bg-burgundy text-cream rounded-full font-medium hover:bg-ink">
              Otvoriť archív
            </Link>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {items.map((r) => (
                <div key={r.id} className="space-y-3">
                  <RecipeCard recipe={r} />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-burnt">
                      {r.tag[lang]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </SiteShell>
  );
}
