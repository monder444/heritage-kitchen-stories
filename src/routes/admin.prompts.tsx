import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { AdminGuard } from "@/components/site/AdminGuard";
import { AdminSubNav } from "@/components/site/AdminSubNav";
import { listPromptsFn, adminDeletePromptFn } from "@/lib/prompts.functions";

export const Route = createFileRoute("/admin/prompts")({
  head: () => ({ meta: [{ title: "Magické témy — Admin · Chuť Archívu" }] }),
  component: () => (<AdminGuard><AdminPromptsPage /></AdminGuard>),
});

function AdminPromptsPage() {
  const qc = useQueryClient();
  const listPrompts = useServerFn(listPromptsFn);
  const adminDelete = useServerFn(adminDeletePromptFn);
  const promptsQ = useQuery({ queryKey: ["prompts", "all"], queryFn: () => listPrompts() });

  const del = useMutation({
    mutationFn: (id: string) => adminDelete({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["prompts"] }); toast.success("Téma zmazaná"); },
    onError: (e: any) => toast.error(e?.message || "Nepodarilo sa zmazať"),
  });

  return (
    <SiteShell>
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end flex-wrap gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-burnt mb-2">Admin</p>
            <h1 className="font-serif text-4xl">Magické témy</h1>
          </div>
          <Link to="/admin/prompts/new" className="px-5 py-2.5 bg-burgundy text-cream rounded-full text-sm font-medium hover:bg-ink">
            + Nová téma
          </Link>
        </div>

        <AdminSubNav active="prompts" />

        {promptsQ.isLoading ? (
          <p className="text-muted-foreground text-center py-12">Načítavam…</p>
        ) : (promptsQ.data ?? []).length === 0 ? (
          <p className="text-center py-12 text-muted-foreground">Žiadne témy zatiaľ neboli vytvorené.</p>
        ) : (
          <div className="bg-card border border-border rounded-3xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground border-b border-border bg-parchment">
                <tr>
                  <th className="text-left py-3 px-5">Poradie</th>
                  <th className="text-left">Slug</th>
                  <th className="text-left">Slovenský názov</th>
                  <th className="text-left">Anglický názov</th>
                  <th className="text-left">Kategória</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(promptsQ.data ?? []).map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-parchment/40">
                    <td className="py-4 px-5 font-mono text-xs">{p.display_order}</td>
                    <td className="py-4 font-mono text-xs">{p.slug}</td>
                    <td className="py-4 font-serif">{p.title.sk}</td>
                    <td className="py-4 font-serif">{p.title.en}</td>
                    <td className="py-4 text-xs text-muted-foreground">{p.category ?? "—"}</td>
                    <td className="py-4 pr-5 text-right">
                      <Link to="/admin/prompts/$id/edit" params={{ id: p.id }} className="text-xs text-burgundy font-semibold hover:underline mr-4">
                        Upraviť
                      </Link>
                      <button
                        onClick={() => { if (confirm(`Zmazať tému „${p.title.sk}"?`)) del.mutate(p.id); }}
                        className="text-xs text-muted-foreground hover:text-burgundy"
                      >
                        Zmazať
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
