"use client";

import { Separator } from "./separator";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
      <div className="grid gap-1">
        <p className="font-semibold text-foreground">Acme UI</p>
        <p className="text-sm text-muted-foreground">An open-source set of animated primitives.</p>
      </div>
      <Separator key={JSON.stringify(p)} className="my-5" {...p} />
      <div className="flex h-5 items-center gap-4 text-sm text-foreground">
        <span>Docs</span>
        <Separator orientation="vertical" animated />
        <span>Source</span>
        <Separator orientation="vertical" animated />
        <span>Changelog</span>
      </div>
      <Separator label="or continue with" variant="gradient" animated className="my-6" />
      <div className="grid grid-cols-2 gap-2">
        {["GitHub", "Google"].map((s) => (
          <button
            key={s}
            className="h-9 rounded-lg border border-border bg-background text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
