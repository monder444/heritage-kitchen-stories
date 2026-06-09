import { Link, useNavigate } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";
import { useScrapbook } from "@/lib/scrapbook";
import { useAuth } from "@/lib/use-auth";

export function SiteShell({ children }: { children: ReactNode }) {
  const { lang, setLang, t } = useLang();
  const { saved } = useScrapbook();
  const { user, isAdmin, isPremium, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent/20">
      <nav className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-10">
            <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-burgundy">
              Chuť Archívu
            </Link>
            <div className="hidden md:flex gap-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Link to="/discover" className="hover:text-burnt transition-colors" activeProps={{ className: "text-burnt" }}>
                {t("nav.discover")}
              </Link>
              <Link to="/scrapbook" className="hover:text-burnt transition-colors" activeProps={{ className: "text-burnt" }}>
                {t("nav.scrapbook")} {saved.length > 0 && <span className="ml-1 text-burnt">·{saved.length}</span>}
              </Link>
              <Link to="/dossiers" className="hover:text-burnt transition-colors" activeProps={{ className: "text-burnt" }}>
                {t("nav.dossiers")}
              </Link>
              <Link to="/book-builder" className="hover:text-burnt transition-colors" activeProps={{ className: "text-burnt" }}>
                {t("nav.builder")}
              </Link>
              {isAdmin && (
                <Link to="/admin" className="hover:text-burnt transition-colors" activeProps={{ className: "text-burnt" }}>
                  {t("nav.admin")}
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-muted/70 p-1 rounded-full text-[10px] font-bold">
              <button
                onClick={() => setLang("sk")}
                className={`px-3 py-1 rounded-full transition-all ${lang === "sk" ? "bg-card shadow-sm text-burgundy" : "text-muted-foreground"}`}
              >
                SK
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1 rounded-full transition-all ${lang === "en" ? "bg-card shadow-sm text-burgundy" : "text-muted-foreground"}`}
              >
                EN
              </button>
            </div>
            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                {isPremium && !isAdmin && (
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-burnt bg-burnt/10 px-2 py-1 rounded-full">Premium</span>
                )}
                {isAdmin && (
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-burgundy bg-burgundy/10 px-2 py-1 rounded-full">Admin</span>
                )}
                <span className="text-xs text-muted-foreground max-w-[140px] truncate">{user.email}</span>
                <button
                  onClick={async () => { await signOut(); toast.success("Odhlásené"); navigate({ to: "/" }); }}
                  className="px-4 py-2 border border-border rounded-full text-xs font-semibold hover:bg-muted"
                >
                  Odhlásiť
                </button>
              </div>
            ) : (
              <Link to="/auth" className="hidden sm:inline-flex px-5 py-2 bg-burgundy text-cream rounded-full text-sm font-medium hover:bg-ink transition-all">
                {t("nav.signin")}
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="border-t border-border mt-24 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="font-serif text-xl font-bold text-burgundy">Chuť Archívu</p>
            <p className="text-xs text-muted-foreground mt-1">{t("footer.tag")}</p>
          </div>
          <div className="flex gap-6 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            <Link to="/discover" className="hover:text-burnt">{t("nav.discover")}</Link>
            <Link to="/dossiers" className="hover:text-burnt">{t("nav.dossiers")}</Link>
            <Link to="/book-builder" className="hover:text-burnt">{t("nav.builder")}</Link>
            <Link to="/admin" className="hover:text-burnt">{t("nav.admin")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
