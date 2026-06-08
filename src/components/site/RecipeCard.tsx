import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Recipe } from "@/lib/recipes";
import { useLang } from "@/lib/i18n";
import { useScrapbook } from "@/lib/scrapbook";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const { lang, t } = useLang();
  const { has, toggle } = useScrapbook();
  const saved = has(recipe.id);

  const onSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(recipe.id);
    toast.success(
      saved
        ? lang === "sk" ? "Odstránené zo zápisníka" : "Removed from scrapbook"
        : lang === "sk" ? "Uložené do zápisníka" : "Saved to scrapbook"
    );
  };

  return (
    <Link
      to="/viewer/$id"
      params={{ id: recipe.id }}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-2xl aspect-[4/5] bg-parchment ring-1 ring-black/5 shadow-sm">
        <img
          src={recipe.image}
          alt={recipe.title[lang]}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span
          className={`absolute top-4 left-4 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-[0.15em] ${
            recipe.premium ? "bg-burgundy text-cream" : "bg-cream/95 text-ink"
          }`}
        >
          {recipe.premium ? t("common.premium") : t("common.free")}
        </span>
        <button
          type="button"
          onClick={onSave}
          aria-label={saved ? t("common.saved") : t("common.save")}
          className={`absolute top-3 right-3 size-9 grid place-items-center rounded-full backdrop-blur-sm border transition-all ${
            saved
              ? "bg-burgundy text-cream border-burgundy"
              : "bg-cream/85 text-ink border-cream/40 opacity-0 group-hover:opacity-100 hover:bg-cream"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
        <span className="absolute bottom-4 left-4 text-[10px] font-mono uppercase tracking-widest text-cream bg-ink/60 backdrop-blur-sm px-2 py-1 rounded">
          {recipe.era}
        </span>
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="font-serif text-xl text-foreground group-hover:text-burnt transition-colors leading-snug">
          {recipe.title[lang]}
        </h3>
        <p className="text-[11px] text-muted-foreground italic leading-relaxed">
          {t("common.source")}: {recipe.source[lang]}
        </p>
      </div>
    </Link>
  );
}
