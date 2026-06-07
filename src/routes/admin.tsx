import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { recipes } from "@/lib/recipes";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Chuť Archívu" }] }),
  component: AdminPage,
});

const stats = [
  { label: "Skenované strany", value: "12 480" },
  { label: "Recepty v archíve", value: "1 274" },
  { label: "Aktívni predplatitelia", value: "642" },
  { label: "Objednávky tento mesiac", value: "38" },
];

const queue = [
  { id: "Q-2041", source: "Vansová, T. (1914) · strany 84–110", status: "OCR review", confidence: 91 },
  { id: "Q-2040", source: "Babilon, J. (1870) · strany 12–30", status: "Pripravené", confidence: 97 },
  { id: "Q-2039", source: "Mobilný upload — Helena Mrázová", status: "Čaká na schválenie", confidence: 78 },
  { id: "Q-2038", source: "Archív SNK · Fond 12 / 1923", status: "Modernizácia", confidence: 95 },
];

const orders = [
  { id: "#2026-119", customer: "M. Novák", item: "Tvrdá väzba — Moja rodinná kuchárka", total: "59,00 €", status: "Vo výrobe" },
  { id: "#2026-118", customer: "Z. Krátka", item: "PDF — Liptov pred priemyselnou revolúciou", total: "9,50 €", status: "Doručené" },
  { id: "#2026-117", customer: "P. Šimko", item: "Mäkká väzba — Vianoce s babičkou", total: "29,00 €", status: "Expedované" },
];

function AdminPage() {
  return (
    <SiteShell>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-end flex-wrap gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-burnt mb-3">Admin</p>
            <h1 className="font-serif text-5xl leading-tight">Prehľad archívu</h1>
          </div>
          <button className="px-5 py-2.5 bg-burgundy text-cream rounded-full text-sm font-medium hover:bg-ink">
            + Nové nahrávanie
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-3">{s.label}</p>
              <p className="font-serif text-4xl text-burgundy">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Ingestion queue */}
        <div className="bg-card border border-border rounded-3xl p-8 mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-2xl">OCR fronta</h2>
            <div className="flex gap-2 text-xs">
              <button className="px-3 py-1.5 rounded-full bg-burgundy text-cream font-semibold">PDF</button>
              <button className="px-3 py-1.5 rounded-full border border-border font-semibold hover:border-burnt">URL</button>
              <button className="px-3 py-1.5 rounded-full border border-border font-semibold hover:border-burnt">Mobil</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left py-3 font-bold">ID</th>
                  <th className="text-left font-bold">Zdroj</th>
                  <th className="text-left font-bold">Stav</th>
                  <th className="text-right font-bold">Istota</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {queue.map((q) => (
                  <tr key={q.id} className="border-b border-border last:border-0">
                    <td className="py-4 font-mono text-xs text-muted-foreground">{q.id}</td>
                    <td className="py-4">{q.source}</td>
                    <td className="py-4">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-1 rounded-full bg-parchment border border-border">
                        {q.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span className={`font-mono text-xs ${q.confidence >= 90 ? "text-burnt" : "text-muted-foreground"}`}>{q.confidence}%</span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="text-xs text-burgundy font-semibold hover:underline">Otvoriť →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Two columns: orders + recipes */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-3xl p-8">
            <h2 className="font-serif text-2xl mb-6">Objednávky</h2>
            <ul className="divide-y divide-border">
              {orders.map((o) => (
                <li key={o.id} className="py-4 flex justify-between items-start gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{o.id} · {o.customer}</p>
                    <p className="text-sm mt-1">{o.item}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-serif text-lg text-burgundy">{o.total}</p>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{o.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8">
            <h2 className="font-serif text-2xl mb-6">Najnovšie recepty</h2>
            <ul className="space-y-4">
              {recipes.map((r) => (
                <li key={r.id} className="flex items-center gap-4">
                  <img src={r.image} alt="" loading="lazy" className="size-14 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-base truncate">{r.title.sk}</p>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{r.era} · {r.region.sk}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-1 rounded-full ${r.premium ? "bg-burgundy text-cream" : "bg-burnt/10 text-burnt"}`}>
                    {r.premium ? "Premium" : "Voľne"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
