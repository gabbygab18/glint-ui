"use client";

import { StatsCount, type StatCountItem } from "./stats-count";

const stats: StatCountItem[] = [
  { value: 2.4, decimals: 1, suffix: "M", label: "Deploys a week", description: "Across every region" },
  { value: 99.99, decimals: 2, suffix: "%", label: "Uptime", description: "Trailing twelve months" },
  { value: 38, suffix: "ms", label: "Median TTFB", description: "Measured at the edge" },
  { value: 12500, suffix: "+", label: "Teams", description: "From startups to Fortune 500" },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-full max-w-5xl">
      <p className="mb-2 px-5 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground md:px-7">By the numbers</p>
      <h2 className="mb-12 max-w-xl px-5 text-3xl font-semibold tracking-tight text-foreground md:px-7">
        Infrastructure that scales with your ambition.
      </h2>
      <StatsCount stats={stats} {...p} />
    </div>
  );
}
