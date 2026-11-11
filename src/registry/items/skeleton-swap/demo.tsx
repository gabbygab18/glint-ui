"use client";

import { RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import { SkeletonSwap } from "./skeleton-swap";

export default function Demo(p: Record<string, unknown>) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => setLoading(false), 1800);
    return () => window.clearTimeout(t);
  }, [loading]);

  return (
    <div className="w-80 rounded-2xl border border-border bg-card p-5 shadow-xl">
      <SkeletonSwap {...p} loading={loading}>
        <div className="flex gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            MR
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Mara Reyes</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Pushed the new onboarding flow to staging. Two screens left to polish before Friday&apos;s review, then it
              ships.
            </p>
          </div>
        </div>
      </SkeletonSwap>
      <button
        type="button"
        onClick={() => setLoading(true)}
        disabled={loading}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        <RotateCw className="size-3.5" /> Reload
      </button>
    </div>
  );
}
