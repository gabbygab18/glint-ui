"use client";

import { ElectricBorder } from "./electric-border";

export default function Demo(p: Record<string, unknown>) {
  const radius = (p.radius as number | undefined) ?? 24;
  return (
    <ElectricBorder {...p}>
      <div className="w-72 bg-card/80 p-7 backdrop-blur" style={{ borderRadius: radius }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Voltage · 12kV</p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Electric Border</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Arcs crawl the perimeter on a seamless loop, drawn on a single canvas.
        </p>
        <button className="mt-6 w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground">
          Power on
        </button>
      </div>
    </ElectricBorder>
  );
}
