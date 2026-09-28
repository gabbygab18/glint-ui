"use client";

import { createClient, type User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Browser client. Pages stay fully static; auth and favorites run client-side
// under Row Level Security, so no server session or proxy is needed.
// Null when env vars are missing: the site still works, minus accounts.
export const supabase = url && key ? createClient(url, key, { auth: { flowType: "pkce" } }) : null;

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!supabase);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export const signIn = () =>
  supabase?.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: window.location.href },
  });

export const signOut = () => supabase?.auth.signOut();
