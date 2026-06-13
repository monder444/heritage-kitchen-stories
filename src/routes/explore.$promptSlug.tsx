import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteShell } from "@/components/site/SiteShell";
import { RecipeCard } from "@/components/site/RecipeCard";
import { useLang } from "@/lib/i18n";
import { getPromptBySlugFn } from "@/lib/prompts.functions";
import { listRecipesByPromptFn } from "@/lib/recipes.functions";
import { recipes as seedRecipes } from "@/lib/recipes";

export const Route = createFileRoute("/explore/$promptSlug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.promptSlug} — Chuť Archívu` },
      { name: "description", content: "Kurátorská zbierka historických receptov k vybranej téme." },
    ],
  }),
  notFoundComponent: () => (
    <SiteShell>
      <div className="max-w-2xl mx-auto py-32 text-center px-6">
        <h1 className="font-serif text-5xl text-burgundy mb-4">Téma sa nenašla</h1>
        <Link to="/" className="text-burnt underline">Späť na úvod</Link>
      </div>
    </SiteShell>
  ),
  errorComponent: ({ error }) => (
    <SiteShell>
      <div className="max-w-2xl mx-auto py-32 text-center px-6">
        <h1 className="font-serif text-3xl text-burgundy mb-4">Niečo zlyhalo</h1>
        <p className="text-muted-foreground text-sm">{error.message}</p>
      </div>
    </SiteShell>
  ),
  component: ExplorePromptPage,
});

function ExplorePromptPage() {
  const { promptSlug } = Route.useParams();
  const { lang } = useLang();
  const getPrompt = useServerFn(getPromptBySlugFn);
  const listByPrompt = useServerFn(listRecipesByPromptFn);

  const promptQ = useQuery({
    queryKey: ["prompt", "slug", promptSlug],
    queryFn: () => getPrompt({ data: { slug: promptSlug } }),
    staleTime: 60_000,
  });

  const recipesQ = useQuery({
    queryKey: ["recipes", "by-prompt", promptQ.data?.id],
    queryFn: () => listByPrompt({ data: { promptId: promptQ.data!.id } }),
    enabled: !!promptQ.data?.id,
  });

  if (promptQ.isLoading) {
    return (
      <SiteShell>
        <section className="max-w-7xl mx-auto px-6 py-24 text-center text-muted-foreground">Načítavam tému…</section>
      </SiteShell>
    );
  }
  if (!promptQ.data) throw notFound();

  const prompt = promptQ.data;
  const dbRecipes = recipesQ.data ?? [];
  // Fallback: also include seed recipes tagged with this slug for demo content.
  const seedMatches = seedRecipes.filter((r) => r.promptSlugs?.includes(prompt.slug));
  const recipes = [...dbRecipes, ...seedMatches];

  return (
    <SiteShell>
      <section className="bg-parchment paper-texture border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <Link to="/" className="text-xs font-bold uppercase tracking-[0.18em] text-burnt hover:underline">← Magické témy</Link>
          <h1 className="font-serif text-5xl md:text-6xl text-burgundy mt-6 mb-4">{prompt.title[lang]}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">{prompt.description[lang]}</p>
          {prompt.category && (
            <span className="inline-block mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-burnt bg-burnt/10 px-3 py-1.5 rounded-full">
              {prompt.category}
            </span>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        {recipesQ.isLoading ? (
          <p className="text-muted-foreground text-center py-12">Načítavam recepty…</p>
        ) : recipes.length === 0 ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <p className="font-serif text-2xl text-burgundy mb-3 italic">Zbierka sa zatiaľ pripravuje</p>
            <p className="text-sm text-muted-foreground">K tejto téme zatiaľ nie sú v archíve recepty. Skontrolujte to čoskoro — kurátori pridávajú nové prepisy každý týždeň.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
