"use client";

import { demoImages } from "../../demo-kit";
import { DecayCard } from "./decay-card";

const [image] = demoImages(1, 600, 800).map((u) => u.replace("glint-1", "glint-decay"));

export default function Demo(p: Record<string, unknown>) {
  return (
    <DecayCard {...p} image={image} alt="Sample photo">
      <p className="text-xs uppercase tracking-[.3em] text-white/60">Move fast</p>
      <p className="mt-1 font-serif text-5xl italic tracking-tight">Decay</p>
    </DecayCard>
  );
}
