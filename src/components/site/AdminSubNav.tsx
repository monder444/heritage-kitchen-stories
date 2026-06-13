import { Link } from "@tanstack/react-router";

export function AdminSubNav({ active }: { active: "recipes" | "prompts" }) {
  return (
    <div className="flex gap-2 mb-8 border-b border-border">
      <Link to="/admin" className={`px-5 py-3 -mb-px text-sm font-semibold border-b-2 transition-colors ${active === "recipes" ? "border-burgundy text-burgundy" : "border-transparent text-muted-foreground hover:text-burnt"}`}>
        Recepty
      </Link>
      <Link to="/admin/prompts" className={`px-5 py-3 -mb-px text-sm font-semibold border-b-2 transition-colors ${active === "prompts" ? "border-burgundy text-burgundy" : "border-transparent text-muted-foreground hover:text-burnt"}`}>
        Magické témy
      </Link>
    </div>
  );
}
