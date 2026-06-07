import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { useLang } from "@/lib/i18n";
import { dossiers } from "@/lib/recipes";
import dossierImg from "@/assets/dossier-cover.jpg";

export const Route = createFileRoute("/dossiers")({
  head: () => ({
    meta: [{ title: "Deep Dive Dossiers — Chuť Archívu" }, { name: "description", content: "Prémiové štúdie o slovenskej historickej gastronómii." }],
  }),
  component: DossiersPage,
});

function DossiersPage() {
  const { lang } = useLang();
  return (
    <SiteShell>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-burnt mb-4">Premium</p>
        <h1 className="font-serif text-5xl md:text-6xl leading-tight mb-6">Deep Dive Dossiers</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-12">
          Komentované štúdie o regionálnej slovenskej gastronómii. Každá obsahuje desiatky receptov, historický kontext a faksimile prameňov.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {dossiers.map((d, i) => (
            <article key={d.id} className="bg-card border border-border rounded-3xl overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="aspect-[4/3] overflow-hidden bg-parchment">
                <img
                  src={dossierImg}
                  alt={d.title[lang]}
                  loading="lazy"
                  className={`w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ${i === 1 ? "saturate-[0.8]" : i === 2 ? "hue-rotate-[330deg]" : ""}`}
                />
              </div>
              <div className="p-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-burnt mb-3">{d.pages} strán · PDF + ePub</p>
                <h3 className="font-serif text-2xl mb-3 leading-snug">{d.title[lang]}</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{d.blurb[lang]}</p>
                <div className="flex justify-between items-center">
                  <span className="font-serif text-2xl text-burgundy">{d.price}</span>
                  <button className="px-5 py-2 bg-ink text-cream rounded-full text-sm font-medium hover:bg-burnt transition-colors">
                    Pridať do košíka
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="mt-20 bg-parchment border border-border rounded-3xl p-10 paper-texture">
          <h2 className="font-serif text-3xl mb-3">Predplatné Archív+</h2>
          <p className="text-muted-foreground max-w-xl mb-6">Neobmedzený prístup ku všetkým dossierom, prémiovým receptom a zľava 20% na tlačené knihy.</p>
          <button className="px-6 py-3 bg-burgundy text-cream rounded-full font-medium hover:bg-ink">
            Vyskúšať za 9,90 € / mesiac
          </button>
        </aside>
      </section>
    </SiteShell>
  );
}
