"use client";

import { ReactionBar } from "./reaction-bar";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-80 rounded-2xl border border-border bg-card p-5 pt-16 shadow-xl">
      <div className="flex items-center gap-2.5">
        <div className="grid size-9 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">JL</div>
        <div>
          <p className="text-sm font-semibold text-foreground">Jo Lim</p>
          <p className="text-xs text-muted-foreground">2 min ago</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground">We just shipped dark mode to everyone. Took three tries, worth it.</p>
      <div className="mt-4">
        <ReactionBar {...p} />
      </div>
    </div>
  );
}
