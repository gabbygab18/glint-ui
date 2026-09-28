"use client";

import { useState } from "react";
import { VoicePill } from "./voice-pill";

export default function Demo(p: Record<string, unknown>) {
  const [sent, setSent] = useState<number[]>([]);
  return (
    <div className="flex flex-col items-center gap-5 px-4">
      <div className="flex min-h-10 flex-wrap justify-center gap-2">
        {sent.map((s, i) => (
          <span key={i} className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            Voice note · {Math.floor(s / 60)}:{String(s % 60).padStart(2, "0")}
          </span>
        ))}
      </div>
      <VoicePill {...p} onSend={(s) => setSent((v) => [...v.slice(-3), s])} />
      <p className="text-xs text-muted-foreground">Simulated input: no microphone access needed.</p>
    </div>
  );
}
