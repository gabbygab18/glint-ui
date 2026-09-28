"use client";

import { useState } from "react";
import { SloshGauge } from "./slosh-gauge";

const presets = [12, 38, 62, 90];

export default function Demo(p: Record<string, unknown>) {
  const [v, setV] = useState(62);
  return (
    <div className="flex flex-col items-center gap-6">
      <SloshGauge {...p} value={v} onChange={setV} />
      <div className="flex gap-2">
        {presets.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setV(n)}
            className={`h-8 rounded-full border px-3 text-xs font-medium tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
              v === n ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            {n}%
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Drag the tank up or down, or use the arrow keys.</p>
    </div>
  );
}
