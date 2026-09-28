"use client";

import { useState } from "react";
import { TearTicket } from "./tear-ticket";

export default function Demo(p: Record<string, unknown>) {
  const [n, setN] = useState(0);
  const [torn, setTorn] = useState(false);
  return (
    <div className="flex flex-col items-center gap-6 px-4">
      <TearTicket key={n} {...p} onTear={() => setTorn(true)} />
      <div className="flex h-8 items-center gap-3 text-xs text-muted-foreground">
        {torn ? (
          <button
            type="button"
            onClick={() => {
              setN((v) => v + 1);
              setTorn(false);
            }}
            className="rounded-full border border-border bg-card px-3 py-1.5 font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
          >
            Reprint ticket
          </button>
        ) : (
          <span>Drag the stub away to tear it off (or focus it and press Enter).</span>
        )}
      </div>
    </div>
  );
}
