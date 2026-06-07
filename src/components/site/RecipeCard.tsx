import { Link } from "@tanstack/react-router";
import type { Recipe } from "@/lib/recipes";
import { useLang } from "@/lib/i18n";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const { lang, t } = useLang();
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
