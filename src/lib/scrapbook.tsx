import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Ctx = {
  saved: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
};
const ScrapCtx = createContext<Ctx | null>(null);
const KEY = "ca.scrapbook";

export function ScrapbookProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch { /* noop */ }
  }, [saved]);

  const toggle = (id: string) =>
    setSaved((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const has = (id: string) => saved.includes(id);
  const clear = () => setSaved([]);

  return <ScrapCtx.Provider value={{ saved, toggle, has, clear }}>{children}</ScrapCtx.Provider>;
}

export function useScrapbook() {
  const ctx = useContext(ScrapCtx);
  if (!ctx) throw new Error("useScrapbook must be used inside ScrapbookProvider");
  return ctx;
}
