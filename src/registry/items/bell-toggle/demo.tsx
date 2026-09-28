"use client";

import { BellToggle } from "./bell-toggle";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="grid gap-5 rounded-2xl border border-border bg-card p-6 shadow-xl">
      <BellToggle key={String(p.defaultChecked)} {...p} />
      <div className="h-px bg-border" />
      <BellToggle label="Mentions" defaultChecked={false} color="#8b5cf6" />
    </div>
  );
}
