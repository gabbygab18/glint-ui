"use client";

import { WakeSlider } from "./wake-slider";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="grid w-full max-w-sm gap-8 rounded-2xl border border-border bg-card p-6 shadow-xl">
      <WakeSlider {...p} />
      <WakeSlider label="Warmth" color="#f97316" defaultValue={70} trail={0.85} />
    </div>
  );
}
