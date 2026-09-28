"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase, useUser } from "./supabase";

const EMPTY = new Set<string>();

export function useFavorites() {
  const { user, loading: userLoading } = useUser();
  // Tagged with the user id so a sign-out or account switch never shows stale rows.
  const [data, setData] = useState<{ userId: string; slugs: Set<string> } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !user) return;
    let cancelled = false;
    supabase
      .from("favorites")
      .select("slug")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(error.message);
        else setData({ userId: user.id, slugs: new Set(data.map((r) => r.slug as string)) });
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const ready = !!user && data?.userId === user.id;
  const slugs = ready ? data.slugs : EMPTY;
  const loading = userLoading || (!!supabase && !!user && !ready && !error);

  const toggle = useCallback(
    async (slug: string) => {
      if (!supabase || !user) return;
      const had = slugs.has(slug);
      // Optimistic: flip now, roll back if the write fails.
      const flip = (on: boolean) =>
        setData((d) => {
          const n = new Set(d?.slugs);
          if (on) n.add(slug);
          else n.delete(slug);
          return { userId: user.id, slugs: n };
        });
      flip(!had);
      const { error } = had
        ? await supabase.from("favorites").delete().eq("slug", slug).eq("user_id", user.id)
        : await supabase.from("favorites").insert({ slug });
      if (error) {
        flip(had);
        setError(error.message);
      }
    },
    [slugs, user],
  );

  return { user, slugs, loading, error, toggle };
}
