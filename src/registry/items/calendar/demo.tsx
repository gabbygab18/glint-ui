"use client";

import { useState } from "react";
import { Calendar, type DateRange } from "./calendar";

const short = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });

export default function Demo(p: Record<string, unknown>) {
  const mode = p.mode === "range" ? "range" : "single";
  const [pick, setPick] = useState<{ mode: string; range: DateRange } | null>(null);
  const picked = pick?.mode === mode ? pick.range : null;

  let summary = mode === "range" ? "Select check-in and check-out" : "Select a date";
  if (picked?.to && mode === "range") {
    const nights = Math.round((picked.to.getTime() - picked.from.getTime()) / 864e5);
    summary = `${short.format(picked.from)} – ${short.format(picked.to)} · ${nights} night${nights === 1 ? "" : "s"}`;
  } else if (picked) summary = mode === "range" ? `${short.format(picked.from)} – choose check-out` : short.format(picked.from);

  return (
    <div key={mode} className="grid gap-3">
      <Calendar
        {...p}
        mode={mode}
        weekStartsOn={p.weekStartsOn === 1 ? 1 : 0}
        onSelect={(v: Date | DateRange) => setPick({ mode, range: v instanceof Date ? { from: v, to: v } : v })}
        className="shadow-2xl"
      />
      <p aria-live="polite" className="text-center text-sm text-muted-foreground">
        {summary}
      </p>
    </div>
  );
}
