import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { listSavedFn, mergeScrapbookFn, toggleSavedFn } from "./scrapbook.functions";
import { useAuth } from "./use-auth";

type Ctx = {
  saved: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
};
const ScrapCtx = createContext<Ctx | null>(null);
const KEY = "ca.scrapbook";

function readLocal(): string[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}
function writeLocal(ids: string[]) {
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* noop */ }
}

export function ScrapbookProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const listSaved = useServerFn(listSavedFn);
  const toggleSaved = useServerFn(toggleSavedFn);
  const mergeScrapbook = useServerFn(mergeScrapbookFn);

  // Guest state — localStorage
  const [local, setLocal] = useState<string[]>([]);
  useEffect(() => { setLocal(readLocal()); }, []);
  useEffect(() => { writeLocal(local); }, [local]);

  // Authenticated state — DB
  const q = useQuery({
    queryKey: ["scrapbook", user?.id ?? null],
    queryFn: () => listSaved(),
    enabled: !!user,
    staleTime: 30_000,
  });

  // On sign-in, merge guest entries into DB once, then clear local.
  useEffect(() => {
    if (!user) return;
    const guestIds = readLocal();
    if (guestIds.length === 0) return;
    mergeScrapbook({ data: { recipeIds: guestIds } })
      .then(() => {
        writeLocal([]);
        setLocal([]);
        qc.invalidateQueries({ queryKey: ["scrapbook"] });
      })
      .catch(() => { /* keep local until next attempt */ });
  }, [user, mergeScrapbook, qc]);

  const toggleMut = useMutation({
    mutationFn: (recipeId: string) => toggleSaved({ data: { recipeId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scrapbook"] }),
  });

  const saved = user ? (q.data ?? []) : local;

  const has = useCallback((id: string) => saved.includes(id), [saved]);

  const toggle = useCallback(
    (id: string) => {
      if (user) {
        toggleMut.mutate(id, {
          onError: (e: any) => toast.error(e?.message || "Nepodarilo sa uložiť"),
        });
      } else {
        setLocal((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
      }
    },
    [user, toggleMut],
  );

  const clear = useCallback(() => {
    if (user) {
      // delete all DB entries by toggling each off
      saved.forEach((id) => toggleMut.mutate(id));
    } else {
      setLocal([]);
    }
  }, [user, saved, toggleMut]);

  const value = useMemo(() => ({ saved, toggle, has, clear }), [saved, toggle, has, clear]);

  return <ScrapCtx.Provider value={value}>{children}</ScrapCtx.Provider>;
}

export function useScrapbook() {
  const ctx = useContext(ScrapCtx);
  if (!ctx) throw new Error("useScrapbook must be used inside ScrapbookProvider");
  return ctx;
}
