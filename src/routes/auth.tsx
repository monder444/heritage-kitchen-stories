import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Prihlásenie — Chuť Archívu" }] }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    // Already signed in — bounce home.
    if (typeof window !== "undefined") setTimeout(() => navigate({ to: "/" }), 0);
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const redirectTo = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo, data: { display_name: displayName || email.split("@")[0] } },
        });
        if (error) throw error;
        toast.success("Účet vytvorený. Skontrolujte e-mail pre potvrdenie alebo sa rovno prihláste.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Vitajte späť v archíve");
        router.invalidate();
        navigate({ to: "/" });
      }
    } catch (err: any) {
      toast.error(err?.message || "Prihlásenie zlyhalo");
    } finally {
      setBusy(false);
    }
  };

  const cls = "w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-burnt/30 text-sm";

  return (
    <SiteShell>
      <section className="max-w-md mx-auto px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-burnt mb-3 text-center">
          Chuť Archívu
        </p>
        <h1 className="font-serif text-4xl text-center mb-3">
          {mode === "signin" ? "Vitajte späť" : "Pridajte sa do archívu"}
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-10">
          {mode === "signin"
            ? "Prihláste sa pre prístup k zápisníku, premium receptom a dossierom."
            : "Vytvorte si účet — uložíte si recepty, postavíte vlastnú knihu a získate prístup k novinkám."}
        </p>

        <form onSubmit={submit} className="space-y-4 bg-card border border-border rounded-3xl p-8">
          {mode === "signup" && (
            <label className="block">
              <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">
                Meno
              </span>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={cls} placeholder="Mária Novak" />
            </label>
          )}
          <label className="block">
            <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">E-mail</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={cls} placeholder="vy@email.sk" />
          </label>
          <label className="block">
            <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">Heslo</span>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={cls} placeholder="••••••••" />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full px-6 py-3 bg-burgundy text-cream rounded-full text-sm font-semibold hover:bg-ink disabled:opacity-60"
          >
            {busy ? "Pracujem…" : mode === "signin" ? "Prihlásiť sa" : "Vytvoriť účet"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === "signin" ? (
            <>Nemáte účet? <button onClick={() => setMode("signup")} className="text-burgundy font-semibold underline">Zaregistrujte sa</button></>
          ) : (
            <>Už máte účet? <button onClick={() => setMode("signin")} className="text-burgundy font-semibold underline">Prihláste sa</button></>
          )}
        </p>
      </section>
    </SiteShell>
  );
}
