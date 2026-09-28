"use client";

import { useState } from "react";
import { PaperCrumple } from "./paper-crumple";

export default function Demo(p: Record<string, unknown>) {
  const [round, setRound] = useState(0);
  const [gone, setGone] = useState(false);
  return (
    <div className="grid justify-items-center gap-2">
      <PaperCrumple key={round} {...p} onDelete={() => setGone(true)} />
      <button
        type="button"
        onClick={() => {
          setGone(false);
          setRound((r) => r + 1);
        }}
        className={`text-xs text-muted-foreground underline-offset-4 hover:underline ${gone ? "" : "invisible"}`}
      >
        Write a new note
      </button>
    </div>
  );
}
