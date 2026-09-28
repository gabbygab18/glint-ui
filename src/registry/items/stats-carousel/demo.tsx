"use client";

import { StatsCarousel, type StatItem } from "./stats-carousel";

const stats: StatItem[] = [
  { label: "Monthly revenue", value: 48290, prefix: "$", delta: 12.4, caption: "vs. last 30 days", data: [22, 24, 23, 27, 26, 30, 29, 34, 33, 38, 41, 44] },
  { label: "Active users", value: 12840, delta: 8.1, caption: "Daily average", data: [40, 42, 41, 45, 44, 43, 48, 50, 49, 53, 55, 58] },
  { label: "Conversion rate", value: 3.62, decimals: 2, suffix: "%", delta: -0.4, caption: "Visitors to paid", data: [3.9, 3.8, 3.85, 3.7, 3.75, 3.6, 3.7, 3.65, 3.55, 3.6, 3.58, 3.62] },
  { label: "Avg. order value", value: 86.4, decimals: 2, prefix: "$", delta: 4.2, caption: "Across 2,184 orders", data: [78, 80, 79, 81, 83, 82, 84, 83, 85, 84, 86, 86.4] },
  { label: "Churn", value: 1.9, decimals: 1, suffix: "%", delta: -0.6, invert: true, caption: "Lower is better", data: [2.8, 2.7, 2.6, 2.65, 2.4, 2.3, 2.35, 2.2, 2.1, 2.05, 1.95, 1.9] },
  { label: "p95 latency", value: 142, suffix: "ms", delta: 9.3, invert: true, caption: "Edge API, global", data: [118, 120, 122, 119, 125, 128, 126, 131, 135, 133, 139, 142] },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-full max-w-4xl contain-inline-size">
      <StatsCarousel stats={stats} {...p} />
    </div>
  );
}
