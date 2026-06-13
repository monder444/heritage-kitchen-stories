import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { AdminGuard } from "@/components/site/AdminGuard";
import { AdminSubNav } from "@/components/site/AdminSubNav";
import { getRecipeFn, adminUpdateRecipeFn, adminDeleteRecipeFn } from "@/lib/recipes.functions";
import { listPromptsFn } from "@/lib/prompts.functions";

export const Route = createFileRoute("/admin/recipes/$id/edit")({
  head: () => ({ meta: [{ title: "Upraviť recept — Admin · Chuť Archívu" }] }),
  component: () => (<AdminGuard><EditRecipePage /></AdminGuard>),
});

const input = "w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-burnt/30 text-sm";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}</span>
      {children}
    </label>
  );
}

function EditRecipePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const get = useServerFn(getRecipeFn);
  const update = useServerFn(adminUpdateRecipeFn);
  const del = useServerFn(adminDeleteRecipeFn);
  const listPrompts = useServerFn(listPromptsFn);

  const q = useQuery({ queryKey: ["recipe", id], queryFn: () => get({ data: { id } }) });
  const promptsQ = useQuery({ queryKey: ["prompts", "all"], queryFn: () => listPrompts() });

  const [titleSk, setTitleSk] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [era, setEra] = useState("");
  const [category, setCategory] = useState("");
  const [sourceSk, setSourceSk] = useState("");
  const [sourceYear, setSourceYear] = useState<number | "">("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [premium, setPremium] = useState(false);
  const [promptIds, setPromptIds] = useState<string[]>([]);
  const [introSk, setIntroSk] = useState("");
  const [ingredientsSk, setIngredientsSk] = useState("");
  const [methodSk, setMethodSk] = useState("");

  useEffect(() => {
    const r = q.data?.recipe;
    if (!r) return;
    setTitleSk(r.title.sk); setTitleEn(r.title.en);
    setEra(r.era); setCategory(r.category ?? "");
    setSourceSk(r.source.sk); setSourceYear(r.sourceYear ?? "");
    setSourceUrl(r.sourceUrl ?? ""); setPremium(r.premium);
    setPromptIds(r.promptIds ?? []);
    setIntroSk(r.intro.sk);
    setIngredientsSk((r.ingredients.sk ?? []).join("\n"));
    setMethodSk((r.method.sk ?? []).join("\n"));
  }, [q.data]);

  const mut = useMutation({
    mutationFn: () => update({ data: { id, patch: {
      title: { sk: titleSk, en: titleEn },
      era, category: category || null, premium, promptIds,
      source: { sk: sourceSk, en: sourceSk },
      sourceYear: sourceYear === "" ? null : Number(sourceYear),
      sourceUrl: sourceUrl || null,
      intro: { sk: introSk, en: introSk },
      ingredients: { sk: ingredientsSk.split("\n").filter(Boolean), en: ingredientsSk.split("\n").filter(Boolean) },
      method: { sk: methodSk.split("\n").filter(Boolean), en: methodSk.split("\n").filter(Boolean) },
    } } }),
    onSuccess: () => { toast.success("Recept uložený"); navigate({ to: "/admin" }); },
    onError: (e: any) => toast.error(e?.message || "Chyba"),
  });

  const delMut = useMutation({
    mutationFn: () => del({ data: { id } }),
    onSuccess: () => { toast.success("Recept zmazaný"); navigate({ to: "/admin" }); },
    onError: (e: any) => toast.error(e?.message || "Chyba"),
  });

  if (q.isLoading) return <SiteShell><p className="text-center py-24 text-muted-foreground">Načítavam…</p></SiteShell>;
  if (!q.data?.recipe) return <SiteShell><p className="text-center py-24 text-muted-foreground">Recept sa nenašiel.</p></SiteShell>;

  return (
    <SiteShell>
      <section className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-burnt mb-2">Admin · Upraviť recept</p>
        <h1 className="font-serif text-4xl mb-8">{titleSk || "Recept"}</h1>
        <AdminSubNav active="recipes" />

        <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="bg-card border border-border rounded-3xl p-8 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Názov (SK)"><input value={titleSk} onChange={(e) => setTitleSk(e.target.value)} className={input} /></Field>
            <Field label="Názov (EN)"><input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={input} /></Field>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <Field label="Éra"><input value={era} onChange={(e) => setEra(e.target.value)} className={input} placeholder="1870" /></Field>
            <Field label="Kategória"><input value={category} onChange={(e) => setCategory(e.target.value)} className={input} placeholder="pečenie" /></Field>
            <Field label="Rok zdroja"><input type="number" value={sourceYear} onChange={(e) => setSourceYear(e.target.value === "" ? "" : parseInt(e.target.value))} className={input} /></Field>
            <Field label="Tier">
              <select value={premium ? "premium" : "free"} onChange={(e) => setPremium(e.target.value === "premium")} className={input}>
                <option value="free">Voľne</option><option value="premium">Premium</option>
              </select>
            </Field>
          </div>
          <Field label="Citácia zdroja"><input value={sourceSk} onChange={(e) => setSourceSk(e.target.value)} className={input} /></Field>
          <Field label="URL zdroja"><input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className={input} placeholder="https://…" /></Field>
          <Field label="Úvodný odsek"><textarea rows={2} value={introSk} onChange={(e) => setIntroSk(e.target.value)} className={input} /></Field>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Suroviny (1 riadok = 1)"><textarea rows={6} value={ingredientsSk} onChange={(e) => setIngredientsSk(e.target.value)} className={input} /></Field>
            <Field label="Postup (1 riadok = 1 krok)"><textarea rows={6} value={methodSk} onChange={(e) => setMethodSk(e.target.value)} className={input} /></Field>
          </div>
          <Field label="Magické témy">
            <div className="flex flex-wrap gap-2">
              {(promptsQ.data ?? []).map((p) => {
                const checked = promptIds.includes(p.id);
                return (
                  <button key={p.id} type="button"
                    onClick={() => setPromptIds(checked ? promptIds.filter((x) => x !== p.id) : [...promptIds, p.id])}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${checked ? "bg-burgundy text-cream border-burgundy" : "border-border hover:border-burnt"}`}
                  >
                    {p.title.sk}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="pt-4 flex justify-between gap-3 border-t border-border">
            <div className="flex gap-2">
              <button type="submit" disabled={mut.isPending} className="px-6 py-3 bg-burgundy text-cream rounded-full text-sm font-semibold hover:bg-ink disabled:opacity-50">
                {mut.isPending ? "Ukladám…" : "Uložiť zmeny"}
              </button>
              <Link to="/viewer/$id" params={{ id }} className="px-6 py-3 border border-border rounded-full text-sm font-semibold hover:border-burnt">Náhľad</Link>
            </div>
            <button type="button" onClick={() => { if (confirm(`Zmazať recept „${titleSk}"?`)) delMut.mutate(); }} className="px-6 py-3 border border-border rounded-full text-sm font-semibold text-muted-foreground hover:text-burgundy hover:border-burgundy">
              Zmazať
            </button>
          </div>
        </form>
      </section>
    </SiteShell>
  );
}
