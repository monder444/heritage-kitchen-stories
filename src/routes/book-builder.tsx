import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { useLang } from "@/lib/i18n";
import { useScrapbook } from "@/lib/scrapbook";
import { recipes } from "@/lib/recipes";
import bookImg from "@/assets/book-builder.jpg";

export const Route = createFileRoute("/book-builder")({
  head: () => ({
    meta: [{ title: "Zostaviť knihu — Chuť Archívu" }, { name: "description", content: "Vytvorte si vlastnú tlačenú kuchárku z uložených receptov." }],
  }),
  component: BookBuilderPage,
});

type Format = "pdf" | "softcover" | "hardcover";

const formats: { id: Format; label: string; price: number; note: string }[] = [
  { id: "pdf", label: "Digitálne PDF", price: 9, note: "Okamžité stiahnutie, formát A4" },
  { id: "softcover", label: "Mäkká väzba", price: 29, note: "Tlač do 7 dní, 15×21 cm, krémový papier" },
  { id: "hardcover", label: "Tvrdá väzba s plátnom", price: 59, note: "Ručná väzba, ražba názvu, 15 dní" },
];

function BookBuilderPage() {
  const { lang } = useLang();
  const { saved } = useScrapbook();
  const [title, setTitle] = useState("Moja rodinná kuchárka");
  const [author, setAuthor] = useState("Helena Mrázová");
  const [format, setFormat] = useState<Format>("softcover");

  const items = recipes.filter((r) => saved.includes(r.id));
  const list = items.length > 0 ? items : recipes;
  const selectedFmt = formats.find((f) => f.id === format)!;

  return (
    <SiteShell>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-burnt mb-4">Book Builder</p>
        <h1 className="font-serif text-5xl md:text-6xl leading-tight mb-6">Zostavte vlastnú knihu</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-12">
          Vyberte recepty zo zápisníka, pridajte úvod a venovanie. My zalomíme typografiu a vytlačíme.
        </p>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Editor */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-card border border-border rounded-3xl p-8">
              <h3 className="font-serif text-2xl mb-6">Detaily knihy</h3>
              <div className="space-y-5">
                <label className="block">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Názov</span>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2 w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-burnt/30"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Autor / venovanie</span>
                  <input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="mt-2 w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-burnt/30"
                  />
                </label>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8">
              <h3 className="font-serif text-2xl mb-6">Formát</h3>
              <div className="space-y-3">
                {formats.map((f) => (
                  <label
                    key={f.id}
                    className={`flex items-center justify-between gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                      format === f.id ? "border-burgundy bg-burgundy/5" : "border-border hover:border-burnt"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="format"
                        checked={format === f.id}
                        onChange={() => setFormat(f.id)}
                        className="accent-burgundy"
                      />
                      <div>
                        <p className="font-medium">{f.label}</p>
                        <p className="text-xs text-muted-foreground">{f.note}</p>
                      </div>
                    </div>
                    <span className="font-serif text-xl text-burgundy">{f.price}&nbsp;€</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8">
              <div className="flex justify-between items-baseline mb-6">
                <h3 className="font-serif text-2xl">Obsah ({list.length} receptov)</h3>
                {items.length === 0 && (
                  <Link to="/scrapbook" className="text-xs text-burnt underline">Ukážková zostava</Link>
                )}
              </div>
              <ol className="space-y-3">
                {list.map((r, idx) => (
                  <li key={r.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-parchment transition-colors">
                    <span className="font-mono text-xs text-muted-foreground w-6 text-right">{String(idx + 1).padStart(2, "0")}</span>
                    <img src={r.image} alt="" className="size-12 object-cover rounded-lg" loading="lazy" />
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-base truncate">{r.title[lang]}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]">{r.region[lang]} · {r.era}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Preview + checkout */}
          <aside className="lg:col-span-2">
            <div className="sticky top-24 space-y-6">
              <div className="relative overflow-hidden rounded-3xl bg-ink ring-1 ring-border shadow-2xl">
                <img src={bookImg} alt="Náhľad knihy" loading="lazy" className="w-full aspect-[4/3] object-cover opacity-70" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-cream">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/70 mb-2">Náhľad obálky</p>
                  <h4 className="font-serif text-3xl italic leading-tight">{title}</h4>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] mt-3 text-cream/80">{author}</p>
                </div>
              </div>

              <div className="bg-parchment border border-border rounded-3xl p-7">
                <div className="flex justify-between items-baseline mb-5 pb-5 border-b border-border">
                  <span className="text-sm font-medium">{selectedFmt.label}</span>
                  <span className="font-serif text-3xl text-burgundy">{selectedFmt.price}&nbsp;€</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-2 mb-6">
                  <li>· {list.length} receptov, ~{list.length * 4} strán</li>
                  <li>· Tlač na krémový papier 120g</li>
                  <li>· Citácie a faksimile prameňov</li>
                  <li>· Doručenie po celom Slovensku</li>
                </ul>
                <button className="w-full py-4 bg-burgundy text-cream rounded-xl font-medium hover:bg-ink transition-colors">
                  Pokračovať k pokladni →
                </button>
                <p className="text-[10px] text-center mt-3 text-muted-foreground uppercase tracking-[0.18em]">
                  Bezpečná platba · 14-dňové vrátenie
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
