import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { useAuth } from "@/lib/use-auth";

/** Wrap an admin page; renders gate UI when the viewer is not an admin. */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <SiteShell>
        <section className="max-w-4xl mx-auto px-6 py-24 text-center">
          <p className="text-muted-foreground">Overujem prístup…</p>
        </section>
      </SiteShell>
    );
  }

  if (!user) {
    return (
      <SiteShell>
        <section className="max-w-md mx-auto px-6 py-24 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-burnt mb-3">Admin</p>
          <h1 className="font-serif text-4xl mb-3">Vyžaduje prihlásenie</h1>
          <p className="text-muted-foreground mb-8">Túto časť portálu vidia iba administrátori archívu.</p>
          <Link to="/auth" className="inline-flex px-6 py-3 bg-burgundy text-cream rounded-full text-sm font-semibold hover:bg-ink">
            Prihlásiť sa
          </Link>
        </section>
      </SiteShell>
    );
  }

  if (!isAdmin) {
    return (
      <SiteShell>
        <section className="max-w-md mx-auto px-6 py-24 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-burnt mb-3">Admin</p>
          <h1 className="font-serif text-4xl mb-3">Prístup zamietnutý</h1>
          <p className="text-muted-foreground mb-8">Váš účet nemá oprávnenie pre administrátorské rozhranie.</p>
          <Link to="/" className="inline-flex px-6 py-3 bg-burgundy text-cream rounded-full text-sm font-semibold hover:bg-ink">
            Späť na úvod
          </Link>
        </section>
      </SiteShell>
    );
  }

  return <>{children}</>;
}
