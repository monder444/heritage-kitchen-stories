import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { LangProvider } from "@/lib/i18n";
import { ScrapbookProvider } from "@/lib/scrapbook";
import { RecipeProvider } from "@/lib/recipe-store";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl font-bold text-burgundy">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Stránka sa nenašla</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Tento recept v archíve zatiaľ nemáme.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-burgundy px-5 py-2.5 text-sm font-medium text-cream hover:bg-ink transition-colors"
          >
            Späť do archívu
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl font-semibold">Stránka sa nenačítala</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Niečo sa pokazilo pri otváraní archívu. Skúste obnoviť alebo sa vrátiť domov.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-burgundy px-5 py-2.5 text-sm font-medium text-cream hover:bg-ink transition-colors"
          >
            Skúsiť znova
          </button>
          <a
            href="/"
            className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Domov
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Chuť Archívu — historický kulinársky portál" },
      { name: "description", content: "Slovenský portál pre objavovanie a modernizáciu historických receptov zo skenovaných kuchárok a archívnych zdrojov." },
      { property: "og:title", content: "Chuť Archívu" },
      { property: "og:description", content: "Modernizujeme zabudnuté slovenské recepty s úctou k pôvodnému prameňu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="sk">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <ScrapbookProvider>
          <RecipeProvider>
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
          </RecipeProvider>
        </ScrapbookProvider>
      </LangProvider>
    </QueryClientProvider>
  );
}
