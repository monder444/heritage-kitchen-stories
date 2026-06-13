import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { AdminGuard } from "@/components/site/AdminGuard";
import { AdminSubNav } from "@/components/site/AdminSubNav";
import { adminCreatePromptFn } from "@/lib/prompts.functions";

export const Route = createFileRoute("/admin/prompts/new")({
  head: () => ({ meta: [{ title: "Nová téma — Admin · Chuť Archívu" }] }),
  component: () => (<AdminGuard><NewPromptPage /></AdminGuard>),
});

const ICONS = ["cake", "icecream", "soup_kitchen", "restaurant", "bakery_dining", "local_bar", "celebration", "menu_book"];

function NewPromptPage() {
  const navigate = useNavigate();
  const create = useServerFn(adminCreatePromptFn);
  const [slug, setSlug] = useState("");
  const [titleSk, setTitleSk] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descSk, setDescSk] = useState("");
  const [descEn, setDescEn] = useState("");
  const [icon, setIcon] = useState("menu_book");
  const [category, setCategory] = useState("");
  const [order, setOrder] = useState(99);

  const mut = useMutation({
    mutationFn: () => create({ data: {
      slug, title: { sk: titleSk, en: titleEn },
      description: { sk: descSk, en: descEn },
      icon, category: category || null, display_order: order,
    } }),
    onSuccess: () => { toast.success("Téma vytvorená"); navigate({ to: "/admin/prompts" }); },
    onError: (e: any) => toast.error(e?.message || "Nepodarilo sa vytvoriť"),
  });

  return (
    <SiteShell>
      <section className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-burnt mb-2">Admin · Nová téma</p>
        <h1 className="font-serif text-4xl mb-8">Vytvoriť magickú tému</h1>
        <AdminSubNav active="prompts" />

        <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="bg-card border border-border rounded-3xl p-8 space-y-5">
          <PromptField label="Slug (URL identifikátor) *">
            <input required pattern="[a-z0-9-]+" value={slug} onChange={(e) => setSlug(e.target.value)} className={input} placeholder="napr. velkonocne-tradicie" />
          </PromptField>
          <div className="grid md:grid-cols-2 gap-4">
            <PromptField label="Názov (SK) *"><input required value={titleSk} onChange={(e) => setTitleSk(e.target.value)} className={input} /></PromptField>
            <PromptField label="Názov (EN) *"><input required value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={input} /></PromptField>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <PromptField label="Popis (SK)"><textarea rows={3} value={descSk} onChange={(e) => setDescSk(e.target.value)} className={input} /></PromptField>
            <PromptField label="Popis (EN)"><textarea rows={3} value={descEn} onChange={(e) => setDescEn(e.target.value)} className={input} /></PromptField>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <PromptField label="Ikona">
              <select value={icon} onChange={(e) => setIcon(e.target.value)} className={input}>
                {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </PromptField>
            <PromptField label="Kategória"><input value={category} onChange={(e) => setCategory(e.target.value)} className={input} placeholder="pečenie" /></PromptField>
            <PromptField label="Poradie"><input type="number" min={0} value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 0)} className={input} /></PromptField>
          </div>
          <div className="pt-4 flex gap-3 border-t border-border">
            <button type="submit" disabled={mut.isPending} className="px-6 py-3 bg-burgundy text-cream rounded-full text-sm font-semibold hover:bg-ink disabled:opacity-50">
              {mut.isPending ? "Ukladám…" : "Vytvoriť tému →"}
            </button>
          </div>
        </form>
      </section>
    </SiteShell>
  );
}

const input = "w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-burnt/30 text-sm";
function PromptField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}</span>
      {children}
    </label>
  );
}
