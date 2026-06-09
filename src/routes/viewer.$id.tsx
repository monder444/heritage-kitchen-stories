import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { useLang } from "@/lib/i18n";
import { useScrapbook } from "@/lib/scrapbook";
import { useRecipes } from "@/lib/recipe-store";
import { useAuth } from "@/lib/use-auth";
import { grantPremiumStubFn } from "@/lib/auth.functions";

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
  const { user, isAdmin, isPremium } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const grantPremium = useServerFn(grantPremiumStubFn);
  const entitled = !recipe?.premium || isAdmin || isPremium;
  const [unlocking, setUnlocking] = useState(false);
  const [dark, setDark] = useState(true);
  const [modernizing, setModernizing] = useState(false);
  const [version, setVersion] = useState(2);

  const onSave = () => {
    if (!recipe) return;
    toggle(recipe.id);
    toast.success(
      has(recipe.id)
        ? lang === "sk" ? "Odstránené zo zápisníka" : "Removed from scrapbook"
        : lang === "sk" ? "Uložené do zápisníka" : "Saved to scrapbook"
    );
  };

  const onModernize = () => {
    setModernizing(true);
    setTimeout(() => {
      setModernizing(false);
      setVersion((v) => v + 1);
      toast.success(lang === "sk" ? "Recept znova premodernizovaný" : "Recipe re-modernised");
    }, 900);
  };

  const onPrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const onShare = async () => {
    if (!recipe) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: recipe.title[lang], url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(lang === "sk" ? "Odkaz skopírovaný" : "Link copied");
      }
    } catch { /* user cancelled */ }
  };

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
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={onSave}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  saved ? "bg-burgundy text-cream border-burgundy" : "border-border hover:border-burnt"
                }`}
              >
                {saved ? `✓ ${t("common.saved")}` : `+ ${t("common.save")}`}
              </button>
              <button
                onClick={onShare}
                className="px-4 py-2 rounded-full text-sm font-medium border border-border hover:border-burnt"
                aria-label="Zdieľať"
              >
                {lang === "sk" ? "Zdieľať" : "Share"}
              </button>
              <button
                onClick={onPrint}
                className="px-4 py-2 rounded-full text-sm font-medium border border-border hover:border-burnt print:hidden"
              >
                {lang === "sk" ? "Tlačiť" : "Print"}
              </button>
            </div>
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
          <div className={`relative p-8 md:p-10 transition-colors ${dark ? "bg-ink text-cream" : "bg-card"}`}>
            <div className="flex justify-between items-center mb-6 gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-[0.18em] ${dark ? "bg-cream/10 text-cream" : "bg-burgundy/10 text-burgundy"}`}>
                {t("home.viewer.ai")} · RAG v{version}
              </span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 border text-[10px] rounded-full font-bold ${dark ? "border-cream/30 text-cream/90" : "border-burnt/40 text-burnt"}`}>
                  98% autenticita
                </span>
                <button
                  onClick={() => setDark((d) => !d)}
                  aria-label="Tmavý režim"
                  className={`size-7 grid place-items-center rounded-full border transition-colors ${dark ? "border-cream/30 hover:bg-cream/10" : "border-border hover:border-burnt"}`}
                  title={dark ? "Svetlý režim" : "Tmavý režim"}
                >
                  <span className="text-xs">{dark ? "☀" : "☾"}</span>
                </button>
              </div>
            </div>

            <img
              src={recipe.image}
              alt={recipe.title[lang]}
              loading="lazy"
              className={`w-full aspect-[16/10] object-cover rounded-xl mb-6 transition-opacity ${modernizing ? "opacity-40 animate-pulse" : ""}`}
            />

            {entitled ? (
              <>
                <section className="mb-6">
                  <h2 className={`text-[10px] font-bold uppercase tracking-[0.18em] mb-3 ${dark ? "text-burnt" : "text-burnt"}`}>
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
                <section className="mb-6">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-burnt mb-3">
                    {t("home.viewer.method")}
                  </h2>
                  <ol className="space-y-3 text-sm leading-relaxed">
                    {recipe.method[lang].map((m: string, idx: number) => (
                      <li key={m} className="flex gap-3">
                        <span className={`font-serif italic text-lg leading-none ${dark ? "text-burnt" : "text-burgundy"}`}>{idx + 1}.</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ol>
                </section>
                <button
                  onClick={onModernize}
                  disabled={modernizing}
                  className={`mt-2 w-full py-3 rounded-full text-sm font-semibold border transition-colors disabled:opacity-60 print:hidden ${
                    dark
                      ? "border-cream/30 text-cream hover:bg-cream/10"
                      : "border-burgundy text-burgundy hover:bg-burgundy hover:text-cream"
                  }`}
                >
                  {modernizing
                    ? (lang === "sk" ? "Modernizujem…" : "Modernising…")
                    : (lang === "sk" ? "↻ Premodernizovať recept" : "↻ Re-modernise recipe")}
                </button>
              </>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-burgundy/30 bg-parchment p-8 text-center">
                <p className="font-serif text-2xl text-burgundy mb-3 italic">Tento recept je prémiový</p>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  {user
                    ? "Pre prístup k modernizácii a postupu si aktivujte mesačné členstvo."
                    : "Pre prístup k modernizácii a postupu sa prihláste alebo si aktivujte mesačné členstvo."}
                </p>
                <button
                  onClick={async () => {
                    if (!user) { navigate({ to: "/auth" }); return; }
                    setUnlocking(true);
                    try {
                      await grantPremium();
                      await qc.invalidateQueries({ queryKey: ["auth"] });
                      toast.success("Premium aktivované — vitajte v dossier klube");
                    } catch (e: any) {
                      toast.error(e?.message || "Aktivácia zlyhala");
                    } finally {
                      setUnlocking(false);
                    }
                  }}
                  disabled={unlocking}
                  className="px-6 py-3 bg-burgundy text-cream rounded-full font-medium hover:bg-ink transition-colors disabled:opacity-60"
                >
                  {unlocking ? "Aktivujem…" : user ? "Odomknúť — 4,90 € / mesiac (demo)" : "Prihlásiť sa a odomknúť"}
                </button>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-4">
                  Demo: platba sa zatiaľ neprijíma · zrušiť môžete kedykoľvek
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
