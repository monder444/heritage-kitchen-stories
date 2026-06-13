import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { AdminGuard } from "@/components/site/AdminGuard";
import { AdminSubNav } from "@/components/site/AdminSubNav";
import { getPromptByIdFn, adminUpdatePromptFn, adminDeletePromptFn } from "@/lib/prompts.functions";

export const Route = createFileRoute("/admin/prompts/$id/edit")({
  head: () => ({ meta: [{ title: "Upraviť tému — Admin · Chuť Archívu" }] }),
  component: () => (<AdminGuard><EditPromptPage /></AdminGuard>),
});

const ICONS = ["cake", "icecream", "soup_kitchen", "restaurant", "bakery_dining", "local_bar", "celebration", "menu_book"];
const input = "w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-burnt/30 text-sm";

function EditPromptPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const getOne = useServerFn(getPromptByIdFn);
  const update = useServerFn(adminUpdatePromptFn);
  const del = useServerFn(adminDeletePromptFn);
  const q = useQuery({ queryKey: ["prompt", "id", id], queryFn: () => getOne({ data: { id } }) });

  const [slug, setSlug] = useState("");
  const [titleSk, setTitleSk] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descSk, setDescSk] = useState("");
  const [descEn, setDescEn] = useState("");
  const [icon, setIcon] = useState("menu_book");
  const [category, setCategory] = useState("");
  const [order, setOrder] = useState(0);

  useEffect(() => {
    const p = q.data;
    if (!p) return;
    setSlug(p.slug); setTitleSk(p.title.sk); setTitleEn(p.title.en);
    setDescSk(p.description.sk); setDescEn(p.description.en);
    setIcon(p.icon); setCategory(p.category ?? ""); setOrder(p.display_order);
  }, [q.data]);

  const mut = useMutation({
    mutationFn: () => update({ data: { id, patch: {
      slug, title: { sk: titleSk, en: titleEn }, description: { sk: descSk, en: descEn },
      icon, category: category || null, display_order: order,
    } } }),
    onSuccess: () => { toast.success("Téma uložená"); navigate({ to: "/admin/prompts" }); },
    onError: (e: any) => toast.error(e?.message || "Chyba"),
  });

  const delMut = useMutation({
    mutationFn: () => del({ data: { id } }),
    onSuccess: () => { toast.success("Téma zmazaná"); navigate({ to: "/admin/prompts" }); },
    onError: (e: any) => toast.error(e?.message || "Chyba"),
  });

  if (q.isLoading) return <SiteShell><p className="text-center py-24 text-muted-foreground">Načítavam…</p></SiteShell>;
  if (!q.data) return <SiteShell><p className="text-center py-24 text-muted-foreground">Téma sa nenašla.</p></SiteShell>;

  return (
    <SiteShell>
      <section className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-burnt mb-2">Admin · Upraviť tému</p>
        <h1 className="font-serif text-4xl mb-8">{titleSk || "Téma"}</h1>
        <AdminSubNav active="prompts" />

        <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="bg-card border border-border rounded-3xl p-8 space-y-5">
          <label className="block">
            <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">Slug</span>
            <input required pattern="[a-z0-9-]+" value={slug} onChange={(e) => setSlug(e.target.value)} className={input} />
          </label>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="block"><span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">Názov (SK)</span><input value={titleSk} onChange={(e) => setTitleSk(e.target.value)} className={input} /></label>
            <label className="block"><span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">Názov (EN)</span><input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={input} /></label>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="block"><span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">Popis (SK)</span><textarea rows={3} value={descSk} onChange={(e) => setDescSk(e.target.value)} className={input} /></label>
            <label className="block"><span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">Popis (EN)</span><textarea rows={3} value={descEn} onChange={(e) => setDescEn(e.target.value)} className={input} /></label>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <label className="block">
              <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">Ikona</span>
              <select value={icon} onChange={(e) => setIcon(e.target.value)} className={input}>
                {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </label>
            <label className="block"><span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">Kategória</span><input value={category} onChange={(e) => setCategory(e.target.value)} className={input} /></label>
            <label className="block"><span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">Poradie</span><input type="number" min={0} value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 0)} className={input} /></label>
          </div>
          <div className="pt-4 flex justify-between gap-3 border-t border-border">
            <button type="submit" disabled={mut.isPending} className="px-6 py-3 bg-burgundy text-cream rounded-full text-sm font-semibold hover:bg-ink disabled:opacity-50">
              {mut.isPending ? "Ukladám…" : "Uložiť zmeny"}
            </button>
            <button type="button" onClick={() => { if (confirm(`Zmazať tému „${titleSk}"?`)) delMut.mutate(); }} className="px-6 py-3 border border-border rounded-full text-sm font-semibold text-muted-foreground hover:text-burgundy hover:border-burgundy">
              Zmazať
            </button>
          </div>
        </form>
      </section>
    </SiteShell>
  );
}
