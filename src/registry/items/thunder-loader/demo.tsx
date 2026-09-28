"use client";

import { useEffect, useState } from "react";
import { ThunderLoader } from "./thunder-loader";

export default function Demo(p: Record<string, unknown>) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPct((v) => (v >= 100 ? 0 : Math.min(100, v + 7))), 400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-10">
      <ThunderLoader {...p} />
      <div className="flex items-center gap-4 rounded-full border border-border bg-card py-2 pr-5 pl-3">
        <ThunderLoader size={36} progress={pct} color="#38bdf8" label="Battery" />
        <span className="w-12 text-sm font-medium text-foreground tabular-nums">{pct}%</span>
        <span className="text-xs text-muted-foreground">determinate</span>
      </div>
    </div>
  );
}
