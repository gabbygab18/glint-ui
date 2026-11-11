"use client";

import { GoalRing } from "./goal-ring";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-72 rounded-2xl border border-border bg-card p-6 shadow-xl">
      <p className="mb-5 text-sm font-semibold text-foreground">Today</p>
      <GoalRing {...p} className="w-full" />
    </div>
  );
}
