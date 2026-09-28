"use client";

import { ParticleText } from "./particle-text";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0">
      <ParticleText {...p} />
    </div>
  );
}
