import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { useRecipes, generateFromUrl, generateFromImage, buildRecipe } from "@/lib/recipe-store";

export const Route = createFileRoute("/admin/create")({
  head: () => ({ meta: [{ title: "Vytvoriť recept — Admin · Chuť Archívu" }] }),
  component: AdminCreate,
});

type Tab = "url" | "image" | "manual";

function AdminCreate() {
  const [tab, setTab] = useState<Tab>("url");
  const { add } = useRecipes();
  const navigate = useNavigate();

  const onCreate = (recipe: ReturnType<typeof buildRecipe>) => {
    add(recipe);
    navigate({ to: "/viewer/$id", params: { id: recipe.id } });
  };

  return (
    <SiteShell>
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-burnt mb-3">Admin · Nový recept</p>
          <h1 className="font-serif text-5xl leading-tight mb-3">Pridať do archívu</h1>
          <p className="text-muted-foreground max-w-2xl">
            Tri spôsoby ingescie — odkaz na digitálny zdroj, OCR z naskenovanej fotografie alebo manuálny prepis. Systém v každom prípade preformátuje výstup do jednotného štýlu portálu.
          </p>
        </div>

        <div className="flex gap-2 mb-8 border-b border-border">
          {[
            { id: "url", label: "1 · URL zo zdroja" },
            { id: "image", label: "2 · Foto / sken (OCR)" },
            { id: "manual", label: "3 · Manuálny prepis" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`px-5 py-3 -mb-px text-sm font-semibold border-b-2 transition-colors ${
                tab === t.id ? "border-burgundy text-burgundy" : "border-transparent text-muted-foreground hover:text-burnt"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "url" && <UrlForm onCreate={onCreate} />}
        {tab === "image" && <ImageForm onCreate={onCreate} />}
        {tab === "manual" && <ManualForm onCreate={onCreate} />}
      </section>
    </SiteShell>
  );
}

/* ---------- shared bits ---------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-burnt/30 text-sm";

function PremiumToggle({ premium, setPremium }: { premium: boolean; setPremium: (v: boolean) => void }) {
  return (
    <div className="flex gap-2">
      {[
        { v: false, label: "Voľne dostupné", desc: "Vidia všetci návštevníci" },
        { v: true, label: "Premium", desc: "Iba platiaci členovia" },
      ].map((opt) => (
        <button
          key={String(opt.v)}
          type="button"
          onClick={() => setPremium(opt.v)}
          className={`flex-1 text-left p-4 rounded-2xl border-2 transition-colors ${
            premium === opt.v ? "border-burgundy bg-burgundy/5" : "border-border hover:border-burnt"
          }`}
        >
          <p className="font-serif text-lg text-burgundy">{opt.label}</p>
          <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
        </button>
      ))}
    </div>
  );
}

function SubmitBar({ children }: { children?: React.ReactNode }) {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-4 pt-6 border-t border-border">
      {children}
    </div>
  );
}

/* ---------- URL ---------- */

function UrlForm({ onCreate }: { onCreate: (r: ReturnType<typeof buildRecipe>) => void }) {
  const [url, setUrl] = useState("");
  const [premium, setPremium] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setBusy(true);
    // Mock async pipeline
    setTimeout(() => {
      onCreate(generateFromUrl(url.trim(), premium));
    }, 600);
  };

  return (
    <form onSubmit={submit} className="bg-card border border-border rounded-3xl p-8 space-y-6">
      <Field label="URL receptu z digitálneho zdroja">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://digitalisat.snk.sk/recept/123"
          className={inputCls}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Systém načíta obsah, extrahuje recept a preformátuje ho do štýlu portálu (suroviny, postup, citácia).
        </p>
      </Field>

      <Field label="Dostupnosť">
        <PremiumToggle premium={premium} setPremium={setPremium} />
      </Field>

      <SubmitBar>
        <button
          type="submit"
          disabled={busy || !url.trim()}
          className="px-6 py-3 bg-burgundy text-cream rounded-full text-sm font-semibold hover:bg-ink disabled:opacity-50"
        >
          {busy ? "Spracovávam URL…" : "Vygenerovať recept z URL →"}
        </button>
        <p className="text-xs text-muted-foreground">
          Po úspechu vás presmerujeme na Authenticity Viewer.
        </p>
      </SubmitBar>
    </form>
  );
}

/* ---------- IMAGE ---------- */

function ImageForm({ onCreate }: { onCreate: (r: ReturnType<typeof buildRecipe>) => void }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [era, setEra] = useState("");
  const [region, setRegion] = useState("");
  const [source, setSource] = useState("");
  const [keepOriginal, setKeepOriginal] = useState(true);
  const [premium, setPremium] = useState(false);
  const [busy, setBusy] = useState(false);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDataUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataUrl) return;
    setBusy(true);
    setTimeout(() => {
      onCreate(generateFromImage({
        imageDataUrl: dataUrl,
        title: title || "Recept zo skenu",
        era: era || undefined,
        region: region || undefined,
        source: source || undefined,
        keepOriginal,
        premium,
      }));
    }, 700);
  };

  return (
    <form onSubmit={submit} className="bg-card border border-border rounded-3xl p-8 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Field label="Nahrať obrázok (PNG, JPEG)">
            <label className="flex flex-col items-center justify-center aspect-[4/5] border-2 border-dashed border-border rounded-2xl bg-parchment cursor-pointer hover:border-burnt transition-colors overflow-hidden">
              {dataUrl ? (
                <img src={dataUrl} alt="Nahraný sken" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-8">
                  <p className="font-serif text-2xl text-burgundy mb-2">+ Vyberte obrázok</p>
                  <p className="text-xs text-muted-foreground">Stránka z kuchárky, rukopis alebo fotografia z mobilu</p>
                </div>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </label>
          </Field>
          <label className="mt-3 flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={keepOriginal}
              onChange={(e) => setKeepOriginal(e.target.checked)}
              className="accent-burgundy"
            />
            Zobraziť originálny obrázok v Authenticity Vieweri vedľa vygenerovaného receptu
          </label>
        </div>

        <div className="space-y-5">
          <Field label="Názov receptu">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="napr. Makový závin" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rok / éra">
              <input value={era} onChange={(e) => setEra(e.target.value)} className={inputCls} placeholder="1924" />
            </Field>
            <Field label="Región">
              <input value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls} placeholder="Liptov" />
            </Field>
          </div>
          <Field label="Zdroj / citácia">
            <input value={source} onChange={(e) => setSource(e.target.value)} className={inputCls} placeholder="Archív rodiny Novákovcov" />
          </Field>
          <Field label="Dostupnosť">
            <PremiumToggle premium={premium} setPremium={setPremium} />
          </Field>
        </div>
      </div>

      <SubmitBar>
        <button
          type="submit"
          disabled={!dataUrl || busy}
          className="px-6 py-3 bg-burgundy text-cream rounded-full text-sm font-semibold hover:bg-ink disabled:opacity-50"
        >
          {busy ? "OCR spracovanie…" : "Spustiť OCR a vygenerovať recept →"}
        </button>
        <p className="text-xs text-muted-foreground">
          OCR pipeline rozpozná text, AI ho preformátuje do štruktúry portálu.
        </p>
      </SubmitBar>
    </form>
  );
}

/* ---------- MANUAL ---------- */

function ManualForm({ onCreate }: { onCreate: (r: ReturnType<typeof buildRecipe>) => void }) {
  const [title, setTitle] = useState("");
  const [era, setEra] = useState("");
  const [region, setRegion] = useState("");
  const [source, setSource] = useState("");
  const [intro, setIntro] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [methodText, setMethodText] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [premium, setPremium] = useState(false);
  const [busy, setBusy] = useState(false);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDataUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setTimeout(() => {
      onCreate(buildRecipe({
        title,
        era,
        region,
        source,
        intro,
        ingredientsText,
        methodText,
        originalText,
        image: dataUrl || undefined,
        premium,
      }));
    }, 400);
  };

  return (
    <form onSubmit={submit} className="bg-card border border-border rounded-3xl p-8 space-y-6">
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Názov receptu *">
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="napr. Bryndzové halušky" />
        </Field>
        <Field label="Rok / éra">
          <input value={era} onChange={(e) => setEra(e.target.value)} className={inputCls} placeholder="1870" />
        </Field>
        <Field label="Región">
          <input value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls} placeholder="Liptov" />
        </Field>
        <Field label="Zdroj / citácia">
          <input value={source} onChange={(e) => setSource(e.target.value)} className={inputCls} placeholder="Babilon, J. (1870)" />
        </Field>
      </div>

      <Field label="Úvodný odsek">
        <textarea value={intro} onChange={(e) => setIntro(e.target.value)} rows={2} className={inputCls} placeholder="Krátky úvodný popis receptu…" />
      </Field>

      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Suroviny (jeden riadok = jedna surovina)">
          <textarea value={ingredientsText} onChange={(e) => setIngredientsText(e.target.value)} rows={6} className={inputCls} placeholder={"1 kg zemiakov\n300 g bryndze\n200 g slaniny"} />
        </Field>
        <Field label="Postup (jeden riadok = jeden krok)">
          <textarea value={methodText} onChange={(e) => setMethodText(e.target.value)} rows={6} className={inputCls} placeholder={"Zemiaky postrúhajte…\nCesto dávkujte do vriacej vody…"} />
        </Field>
      </div>

      <Field label="Citáty z pôvodného textu (voliteľné)">
        <textarea value={originalText} onChange={(e) => setOriginalText(e.target.value)} rows={3} className={inputCls} placeholder={"„Vezmi zemiakov dva libry…“"} />
      </Field>

      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Obrázok receptu (voliteľné)">
          <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-border rounded-2xl bg-parchment cursor-pointer hover:border-burnt overflow-hidden">
            {dataUrl ? (
              <img src={dataUrl} alt="Náhľad" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-muted-foreground">+ Pridať fotografiu</span>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
        </Field>

        <Field label="Dostupnosť">
          <PremiumToggle premium={premium} setPremium={setPremium} />
        </Field>
      </div>

      <SubmitBar>
        <button
          type="submit"
          disabled={busy || !title.trim()}
          className="px-6 py-3 bg-burgundy text-cream rounded-full text-sm font-semibold hover:bg-ink disabled:opacity-50"
        >
          {busy ? "Ukladám…" : "Vytvoriť recept →"}
        </button>
        <p className="text-xs text-muted-foreground">Po vytvorení sa zobrazí v Authenticity Vieweri.</p>
      </SubmitBar>
    </form>
  );
}
