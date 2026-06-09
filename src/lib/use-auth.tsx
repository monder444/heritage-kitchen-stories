import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getMyRolesFn } from "./auth.functions";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();
  const getMyRoles = useServerFn(getMyRolesFn);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        qc.invalidateQueries({ queryKey: ["auth"] });
        qc.invalidateQueries({ queryKey: ["scrapbook"] });
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [qc]);

  const rolesQuery = useQuery({
    queryKey: ["auth", "roles", session?.user.id ?? null],
    queryFn: () => getMyRoles(),
    enabled: !!session?.user,
    staleTime: 60_000,
  });

  const value = useMemo<AuthCtx>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      isAdmin: rolesQuery.data?.isAdmin ?? false,
      isPremium: rolesQuery.data?.isPremium ?? false,
      signOut: async () => {
        await qc.cancelQueries();
        qc.clear();
        await supabase.auth.signOut();
      },
    }),
    [session, loading, rolesQuery.data, qc],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
