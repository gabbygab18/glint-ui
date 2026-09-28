"use client";

import { useEffect } from "react";
import { useFavorites } from "@/lib/favorites";
import { useStats, track } from "@/lib/stats";
import { signIn, supabase } from "@/lib/supabase";
import { Heart } from "lucide-react";
import { Button } from "@/registry/items/button/button";

const fmt = new Intl.NumberFormat("en", { notation: "compact" });

/** Stats line + favorite toggle for a component page. Also records the view. */
export function ComponentMeta({ slug }: { slug: string }) {
  const stats = useStats();
  const { user, slugs, toggle, loading } = useFavorites();
  const s = stats?.[slug];
  const saved = slugs.has(slug);

  useEffect(() => track(slug, "view"), [slug]);

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
      {s && (
        <span>
          {fmt.format(s.views)} views · {fmt.format(s.copies)} copies
        </span>
      )}
      {supabase && (
        <Button
          variant={saved ? "secondary" : "outline"}
          size="sm"
          onClick={() => (user ? toggle(slug) : signIn())}
          disabled={loading}
          aria-pressed={user ? saved : undefined}
          startIcon={<Heart className={saved ? "fill-primary text-primary" : undefined} />}
          className="rounded-full"
        >
          {user ? (saved ? "Saved" : "Save") : "Sign in to save"}
          {s && s.favorites > 0 && <span className="text-muted-foreground">· {fmt.format(s.favorites)}</span>}
        </Button>
      )}
    </div>
  );
}
