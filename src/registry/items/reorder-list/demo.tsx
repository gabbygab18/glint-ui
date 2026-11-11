"use client";

import { Bug, Gauge, Palette, Rocket, Search } from "lucide-react";
import type { ReactNode } from "react";
import { ReorderList, type ReorderItem } from "./reorder-list";

const dot = (icon: ReactNode, tone: string) => (
  <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${tone}`}>{icon}</span>
);

const ITEMS: ReorderItem[] = [
  { id: "perf", label: "Speed up the dashboard", description: "Cut first load under 1s", leading: dot(<Gauge className="size-4" />, "bg-sky-500/15 text-sky-500") },
  { id: "bug", label: "Fix the export bug", description: "CSV drops the last row", leading: dot(<Bug className="size-4" />, "bg-rose-500/15 text-rose-500") },
  { id: "theme", label: "Ship dark mode", description: "Tokens are ready", leading: dot(<Palette className="size-4" />, "bg-violet-500/15 text-violet-500") },
  { id: "search", label: "Better search", description: "Fuzzy match and filters", leading: dot(<Search className="size-4" />, "bg-amber-500/15 text-amber-500") },
  { id: "launch", label: "Launch page", description: "Copy and screenshots", leading: dot(<Rocket className="size-4" />, "bg-emerald-500/15 text-emerald-500") },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-[22rem] max-w-full rounded-2xl border border-border bg-background p-4 shadow-xl">
      <p className="mb-1 text-sm font-semibold text-foreground">This sprint</p>
      <p className="mb-3 text-xs text-muted-foreground">Drag by the handle, or focus it and use ↑ ↓.</p>
      <ReorderList {...p} label="Sprint priorities" defaultItems={ITEMS} />
    </div>
  );
}
