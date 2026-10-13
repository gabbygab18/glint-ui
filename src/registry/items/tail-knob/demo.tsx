"use client";

import { TailKnob } from "./tail-knob";

export default function Demo(p: Record<string, unknown>) {
  return <TailKnob key={`${p.defaultValue}-${p.min}-${p.max}`} {...p} />;
}
