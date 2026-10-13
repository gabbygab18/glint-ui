"use client";

import { SwarmWord } from "./swarm-word";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0">
      <SwarmWord {...p} />
    </div>
  );
}
