"use client";

import { Volume1, Volume2 } from "lucide-react";
import { useState } from "react";
import { Slider } from "./slider";

export default function Demo(p: Record<string, unknown>) {
  const [price, setPrice] = useState([120, 380]);
  return (
    <div className="grid w-full max-w-sm gap-8 rounded-2xl border border-border bg-card p-6 pt-8 shadow-xl">
      <div className="grid gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Volume</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Volume1 aria-hidden className="size-4 shrink-0" />
          <Slider defaultValue={[64]} thumbLabels={["Volume"]} {...p} />
          <Volume2 aria-hidden className="size-4 shrink-0" />
        </div>
      </div>
      <div className="grid gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Price range</span>
          <span className="text-muted-foreground tabular-nums">
            ${price[0]} to ${price[1]}
          </span>
        </div>
        <Slider
          value={price}
          onValueChange={setPrice}
          min={0}
          max={500}
          step={10}
          marks={[0, 100, 200, 300, 400, 500].map((v) => ({ value: v, label: `$${v}` }))}
          formatValue={(v) => `$${v}`}
          thumbLabels={["Minimum price", "Maximum price"]}
          name="price"
        />
      </div>
    </div>
  );
}
