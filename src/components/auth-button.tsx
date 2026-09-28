"use client";

import { signIn, signOut, supabase, useUser } from "@/lib/supabase";
import { Button } from "@/registry/items/button/button";

export function AuthButton() {
  const { user, loading } = useUser();
  if (!supabase) return null;
  if (loading) return <div className="size-8 animate-pulse rounded-full bg-border" />;

  if (!user) {
    return (
      <Button size="sm" onClick={signIn} className="rounded-full">
        Sign in
      </Button>
    );
  }

  const avatar = user.user_metadata.avatar_url as string | undefined;
  const name = (user.user_metadata.user_name as string | undefined) ?? user.email ?? "Account";
  return (
    <button
      onClick={signOut}
      title={`Signed in as ${name}. Click to sign out.`}
      className="flex h-8 items-center gap-2 rounded-full border border-border pl-1 pr-3 text-sm text-muted-foreground hover:text-foreground"
    >
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt="" className="size-6 rounded-full" />
      ) : (
        <span className="size-6 rounded-full bg-primary" />
      )}
      Sign out
    </button>
  );
}
