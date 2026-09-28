"use client";

import Link from "next/link";
import { bySlug } from "@/registry";
import { useFavorites } from "@/lib/favorites";
import { signIn, supabase } from "@/lib/supabase";
import { Button } from "@/registry/items/button/button";

export default function FavoritesPage() {
  const { user, slugs, loading, error, toggle } = useFavorites();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <title>Favorites</title>
      <h1 className="text-3xl font-semibold tracking-tight">Favorites</h1>
      <p className="mb-8 mt-2 text-muted-foreground">Components you saved, synced to your account.</p>

      {!supabase ? (
        <Empty title="Accounts are not configured" body="Set the Supabase env vars to enable sign-in and favorites." />
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
