"use client";

import { useEffect, useState } from "react";

export type Stat = { views: number; copies: number; favorites: number };
export type StatsMap = Record<string, Stat>;

// One CDN-cached request per page load, shared by every component that asks.
let pending: Promise<StatsMap> | null = null;
const loadStats = () =>
  (pending ??= fetch("/api/stats")
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({})));

export function useStats() {
  const [stats, setStats] = useState<StatsMap | null>(null);
  useEffect(() => {
    loadStats().then(setStats);
  }, []);
  return stats;
}

export function track(slug: string, event: "view" | "copy") {
  // One view per component per tab session.
  if (event === "view") {
    const k = `viewed:${slug}`;
    try {
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, "1");
    } catch {}
  }
  navigator.sendBeacon?.(`/api/stats/${slug}`, JSON.stringify({ event }));
}
