"use client";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Browser client. Pages stay fully static; auth and favorites run client-side
// under Row Level Security, so no server session or proxy is needed.
// False when env vars are missing: the site still works, minus accounts.
export const hasSupabase = !!(url && key);

// The SDK is ~240 KB, so it loads on demand after hydration instead of in every page's bundle,
// and never at all when Supabase isn't configured.
let client: Promise<SupabaseClient | null> | undefined;
export function getSupabase() {
  client ??= hasSupabase
    ? import("@supabase/supabase-js").then(({ createClient }) => createClient(url!, key!, { auth: { flowType: "pkce" } }))
    : Promise.resolve(null);
  return client;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(hasSupabase);

  useEffect(() => {
    if (!hasSupabase) return;
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    getSupabase().then((sb) => {
      if (!sb || cancelled) return;
      sb.auth.getSession().then(({ data }) => {
        setUser(data.session?.user ?? null);
        setLoading(false);
      });
      const { data } = sb.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
      unsubscribe = () => data.subscription.unsubscribe();
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return { user, loading };
}

export const signIn = async () =>
  (await getSupabase())?.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: window.location.href },
  });

export const signOut = async () => (await getSupabase())?.auth.signOut();
