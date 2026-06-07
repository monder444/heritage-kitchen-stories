import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { RecipeCard } from "@/components/site/RecipeCard";
import { useLang } from "@/lib/i18n";
import { recipes, magicPrompts } from "@/lib/recipes";
import heroImg from "@/assets/hero-cookbook.jpg";
import scanImg from "@/assets/scan-page.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chuť Archívu — Modernizujeme zabudnuté chute Slovenska" },
      { name: "description", content: "Slovenský portál pre objavovanie historických receptov pomocou OCR a AI. Každý recept odkazuje na pôvodný archívny prameň." },
    ],
  }),
  component: Home,
});

function Home() {
  const { lang, t } = useLang();
  const sample = recipes[1];

  return (
    <SiteShell>
      {/* Hero */}
      <header className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <span className="inline-block px-4 py-1.5 bg-burnt/10 text-burnt rounded-full text-xs font-bold uppercase tracking-[0.18em]">
            {t("home.eyebrow")}
          </span>
          <h1 className="text-5xl md:text-7xl font-serif leading-[1.05] text-pretty">
            {t("home.title.1")}{" "}
            <span className="italic text-burgundy">{t("home.title.2")}</span>{" "}
            {t("home.title.3")}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
            {t("home.lede")}
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); }}
            className="relative max-w-lg"
          >
            <input
              type="text"
              placeholder={t("home.search.placeholder")}
              className="w-full pl-6 pr-14 py-4 bg-card border border-border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-burnt/30 text-base"
            />
            <Link
              to="/discover"
              className="absolute right-2 top-1/2 -translate-y-1/2 size-10 grid place-items-center bg-burgundy text-cream rounded-xl hover:bg-burnt transition-colors"
              aria-label="Hľadať"
            >
              →
            </Link>
          </form>
        </div>
        <div className="relative">
          <img
            src={heroImg}
            alt="Otvorená historická slovenská kuchárka s rukou písanými poznámkami"
            width={1200}
            height={1400}
            className="w-full aspect-[4/5] object-cover rounded-3xl shadow-2xl ring-1 ring-black/5"
          />
          <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-2xl shadow-xl max-w-xs border border-border">
            <p className="text-[10px] font-bold text-burnt uppercase tracking-[0.18em] mb-2">{t("home.tip.label")}</p>
            <p className="font-serif italic text-lg text-foreground leading-snug">{t("home.tip.quote")}</p>
          </div>
        </div>
      </header>

      {/* Magic prompt cards */}
      <section className="bg-parchment py-20 border-y border-border paper-texture">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
            <div>
              <h2 className="font-serif text-4xl mb-2">{t("home.prompts.title")}</h2>
              <p className="text-muted-foreground text-sm">{t("home.prompts.sub")}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {magicPrompts.map((p) => (
              <Link
                to="/discover"
                key={p.text.sk}
                className="group bg-card p-8 rounded-3xl border border-border hover:border-burnt hover:shadow-lg transition-all"
              >
                <p className="font-mono text-[10px] text-burnt uppercase tracking-[0.2em] mb-5">
                  {p.label[lang]}
                </p>
                <h3 className="font-serif text-2xl leading-snug mb-6 italic">
                  „{p.text[lang]}“
                </h3>
                <div className="w-8 h-px bg-border group-hover:w-20 group-hover:bg-burnt transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Authenticity Viewer preview */}
      <section className="bg-ink py-20 md:py-24 text-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
            <div>
              <h2 className="text-4xl font-serif mb-4">{t("home.viewer.title")}</h2>
              <p className="text-cream/60 max-w-md leading-relaxed">{t("home.viewer.sub")}</p>
            </div>
            <Link to="/viewer/$id" params={{ id: sample.id }} className="text-burnt font-medium border-b border-burnt pb-1 hover:text-cream hover:border-cream transition-colors">
              {t("home.viewer.demo")} →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-cream/10 border border-cream/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-parchment p-8 flex flex-col items-center justify-center min-h-[500px] relative">
              <div className="absolute top-6 left-6 px-3 py-1 bg-ink/10 rounded text-[10px] font-bold text-ink-soft uppercase tracking-[0.18em]">
                {t("home.viewer.original")}
              </div>
              <img
                src={scanImg}
                alt="Sken historickej strany"
                loading="lazy"
                width={800}
                height={1000}
                className="w-3/4 aspect-[3/4] object-cover shadow-inner border border-border rounded-sm"
              />
            </div>
            <div className="bg-cream p-10 md:p-12 text-foreground flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div className="px-3 py-1 bg-burgundy/10 rounded text-[10px] font-bold text-burgundy uppercase tracking-[0.18em]">
                  {t("home.viewer.ai")}
                </div>
                <span className="text-[10px] text-muted-foreground underline underline-offset-4">
                  {sample.source[lang]}
                </span>
              </div>
              <h3 className="text-3xl font-serif mb-6">{sample.title[lang]}</h3>
              <div className="space-y-6 flex-1">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-burnt">{t("home.viewer.ingredients")}</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {sample.ingredients[lang].slice(0, 3).map((i) => (
                      <li key={i}>• {i}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-burnt">{t("home.viewer.method")}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    {sample.originalLines[lang][0]}
                  </p>
                </div>
              </div>
              <Link
                to="/viewer/$id"
                params={{ id: sample.id }}
                className="mt-10 w-full py-4 bg-ink text-cream rounded-xl font-medium hover:bg-burnt transition-colors text-center"
              >
                {t("home.viewer.save")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest finds */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
          <h2 className="font-serif text-4xl">Posledné nálezy</h2>
          <Link to="/discover" className="text-sm font-bold border-b-2 border-burgundy pb-1 hover:text-burnt hover:border-burnt transition-colors">
            Zobraziť archív →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      </section>

      {/* Scrapbook + Book builder teaser */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-card rounded-3xl p-10 border border-border">
          <h3 className="font-serif text-3xl mb-4">{t("home.scrap.title")}</h3>
          <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
            Uložte si recepty, pridajte vlastné poznámky a štítky. Všetko ostáva odkázané na pôvodný prameň.
          </p>
          <Link to="/scrapbook" className="inline-flex items-center gap-2 text-burgundy font-semibold border-b border-burgundy/40 hover:border-burgundy">
            Otvoriť zápisník →
          </Link>
        </div>
        <Link
          to="/book-builder"
          className="bg-parchment rounded-3xl p-8 border border-border hover:border-burnt transition-all group"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 bg-burgundy rounded-full grid place-items-center text-cream font-serif">B</div>
            <h4 className="font-serif text-xl text-burgundy">{t("home.builder.title")}</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{t("home.builder.lede")}</p>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-burnt group-hover:underline">
            {t("home.builder.cta")} →
          </span>
          <p className="text-[10px] mt-4 text-muted-foreground uppercase tracking-[0.2em]">{t("home.builder.price")}</p>
        </Link>
      </section>
    </SiteShell>
  );
}
