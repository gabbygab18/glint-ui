"use client";

import { PulseHeart } from "./pulse-heart";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex w-80 flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-xl">
      <div className="h-36 rounded-xl bg-gradient-to-br from-rose-300 via-fuchsia-400 to-indigo-500" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Golden hour</p>
          <p className="text-xs text-muted-foreground">@mira · 2h</p>
        </div>
        <PulseHeart key={String(p.defaultLiked)} {...p} />
      </div>
    </div>
  );
}
