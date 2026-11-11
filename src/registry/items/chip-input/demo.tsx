"use client";

import { ChipInput } from "./chip-input";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-80 rounded-2xl border border-border bg-card p-5 shadow-xl">
      <ChipInput defaultValue={["react", "motion", "tailwind"]} {...p} />
    </div>
  );
}
