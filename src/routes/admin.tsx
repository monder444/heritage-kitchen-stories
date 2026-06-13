import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteShell } from "@/components/site/SiteShell";
import { AdminGuard } from "@/components/site/AdminGuard";
import { AdminSubNav } from "@/components/site/AdminSubNav";
import { useRecipes } from "@/lib/recipe-store";
import { listPromptsFn } from "@/lib/prompts.functions";
import { useServerFn as _u } from "@tanstack/react-start";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Chuť Archívu" }] }),
  component: () => (<AdminGuard><AdminPage /></AdminGuard>),
});

function AdminPage() {
  const { all: recipes, userRecipes, remove } = useRecipes();
  const listPrompts = useServerFn(listPromptsFn);
  const promptsQ = useQuery({ queryKey: ["prompts", "all"], queryFn: () => listPrompts() });

  const stats = [
    { label: "Recepty v archíve", value: recipes.length.toString() },
    { label: "Magické témy", value: (promptsQ.data ?? []).length.toString() },
    { label: "Vlastné prepisy", value: userRecipes.length.toString() },
    { label: "Premium recepty", value: recipes.filter((r) => r.premium).length.toString() },
  ];

  return (
    <SiteShell>
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end flex-wrap gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-burnt mb-2">Admin</p>
            <h1 className="font-serif text-4xl">Prehľad archívu</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/create" className="px-5 py-2.5 bg-burgundy text-cream rounded-full text-sm font-medium hover:bg-ink">+ Nový recept</Link>
            <Link to="/admin/prompts/new" className="px-5 py-2.5 border border-border rounded-full text-sm font-medium hover:border-burnt">+ Nová téma</Link>
          </div>
        </div>

        <AdminSubNav active="recipes" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-3">{s.label}</p>
              <p className="font-serif text-4xl text-burgundy">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h2 className="font-serif text-2xl">Recepty</h2>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-burnt">{recipes.length} celkom · {userRecipes.length} vlastných</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground border-b border-border bg-parchment">
                <tr>
                  <th className="text-left py-3 px-5">Názov</th>
                  <th className="text-left">Tier</th>
                  <th className="text-left">Éra</th>
                  <th className="text-left">Kategória</th>
                  <th className="text-left">Rok</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((r) => {
                  const isUser = userRecipes.some((x) => x.id === r.id);
                  return (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-parchment/40">
                      <td className="py-4 px-5">
                        <Link to="/viewer/$id" params={{ id: r.id }} className="font-serif hover:text-burnt">{r.title.sk}</Link>
                        {isUser && <span className="ml-2 text-[10px] uppercase tracking-[0.15em] text-burnt">vlastné</span>}
                      </td>
                      <td className="py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-1 rounded-full ${r.premium ? "bg-burgundy text-cream" : "bg-burnt/10 text-burnt"}`}>
                          {r.premium ? "Premium" : "Voľne"}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-muted-foreground">{r.era}</td>
                      <td className="py-4 text-xs text-muted-foreground">{r.category ?? "—"}</td>
                      <td className="py-4 text-xs text-muted-foreground font-mono">{r.sourceYear ?? "—"}</td>
                      <td className="py-4 pr-5 text-right">
                        {isUser ? (
                          <>
                            <Link to="/admin/recipes/$id/edit" params={{ id: r.id }} className="text-xs text-burgundy font-semibold hover:underline mr-4">Upraviť</Link>
                            <button onClick={() => { if (confirm(`Zmazať recept „${r.title.sk}"?`)) remove(r.id); }} className="text-xs text-muted-foreground hover:text-burgundy">Zmazať</button>
                          </>
                        ) : (
                          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">seed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
