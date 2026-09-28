"use client";

import Link from "next/link";
import { bySlug } from "@/registry";
import { useFavorites } from "@/lib/favorites";
import { signIn, supabase } from "@/lib/supabase";
import { Badge } from "@/registry/items/badge/badge";
import { Button, buttonVariants } from "@/registry/items/button/button";

export default function FavoritesPage() {
  const { user, slugs, loading, error, toggle } = useFavorites();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <title>Favorites</title>
      <h1 className="text-3xl font-semibold tracking-tight">Favorites</h1>
      <p className="mb-8 mt-2 text-muted-foreground">Components you saved, synced to your account.</p>

      {!supabase ? (
        <div className="relative overflow-hidden rounded-3xl border bg-card px-6 py-16 text-center">
          <div aria-hidden className="absolute -top-20 left-1/2 size-64 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex flex-col items-center">
            <Badge shine>Coming soon</Badge>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight">Save your favorites</h2>
            <p className="mt-2 max-w-md text-balance text-muted-foreground">
              Sign in to keep a personal collection of components, synced across devices. It is on its way.
            </p>
            <Link href="/components" className={buttonVariants({ className: "mt-8 rounded-full" })}>
              Browse components
            </Link>
          </div>
        </div>
      ) : loading ? (
        <ul className="space-y-3" aria-busy="true" aria-label="Loading favorites">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-16 animate-pulse rounded-xl bg-card" />
          ))}
        </ul>
      ) : !user ? (
        <Empty title="Sign in to see your favorites" body="Save components from any page and find them here.">
          <Button onClick={signIn} className="mt-4 rounded-full">
            Sign in with GitHub
          </Button>
        </Empty>
      ) : error ? (
        <Empty title="Could not load favorites" body={error} />
      ) : slugs.size === 0 ? (
        <Empty title="No favorites yet" body="Hit “Save” on any component page.">
          <Link href="/components" className="mt-4 inline-block text-sm text-primary hover:underline">
            Browse components →
          </Link>
        </Empty>
      ) : (
        <ul className="space-y-3">
          {[...slugs].map((slug) => {
            const e = bySlug.get(slug);
            if (!e) return null; // Component removed from the registry since it was saved.
            return (
              <li key={slug} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <Link href={`/components/${slug}`} className="min-w-0 flex-1">
                  <p className="font-medium">{e.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{e.description}</p>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => toggle(slug)}>
                  Remove
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

function Empty({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      {children}
    </div>
  );
}
