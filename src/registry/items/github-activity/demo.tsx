"use client";

import { GitHubActivity, type Contribution, type ContributionLevel, type RepoContribution } from "./github-activity";

// Deterministic sample year (seeded PRNG, fixed dates): no network, no hydration mismatch.
function sampleYear(): Contribution[] {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const start = Date.UTC(2025, 8, 28); // a Sunday
  return Array.from({ length: 53 * 7 }, (_, i) => {
    const weekday = i % 7;
    const busy = 0.55 + 0.45 * Math.sin(i / 23) ** 2;
    const raw = rand() * busy * (weekday === 0 || weekday === 6 ? 0.45 : 1);
    const count = raw < 0.28 ? 0 : Math.round(raw * 14);
    const level = (count === 0 ? 0 : Math.min(4, Math.ceil(count / 3.5))) as ContributionLevel;
    return { date: new Date(start + i * 86400000).toISOString().slice(0, 10), count, level };
  });
}

const CONTRIBUTIONS = sampleYear();
const REPOS: RepoContribution[] = [
  { name: "calamansi-ui", count: 184 },
  { name: "react-components-site", count: 97 },
  { name: "dotfiles", count: 23 },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex w-full justify-center px-4">
      <GitHubActivity contributions={CONTRIBUTIONS} repos={REPOS} year={2026} {...p} />
    </div>
  );
}
