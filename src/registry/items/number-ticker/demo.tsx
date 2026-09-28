"use client";

import { useState } from "react";
import { Minus, Plus, Shuffle } from "lucide-react";
import { NumberTicker } from "./number-ticker";

const PRESETS = [12847, 3620, 981, 40215, 7, 250000];

const BUTTON =
  "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-xs font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function Demo(p: Record<string, unknown>) {
  const [value, setValue] = useState(12847);
  const [preset, setPreset] = useState(0);

  return (
    <div className="flex flex-col items-center gap-8 p-4">
      <div className="flex flex-col items-center">
        <NumberTicker {...p} value={value} className="text-4xl tracking-tight sm:text-6xl" />
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Monthly visitors</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button type="button" className={BUTTON} onClick={() => setValue((v) => Math.max(0, v - 275))}>
          <Minus className="size-3.5" />
          275
        </button>
        <button type="button" className={BUTTON} onClick={() => setValue((v) => v + 275)}>
          <Plus className="size-3.5" />
          275
        </button>
        <button
          type="button"
          className={BUTTON}
          onClick={() => {
            const next = (preset + 1) % PRESETS.length;
            setPreset(next);
            setValue(PRESETS[next]);
          }}
        >
          <Shuffle className="size-3.5" />
          Shuffle
        </button>
      </div>
    </div>
  );
}
