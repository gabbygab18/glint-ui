"use client";

import { useState } from "react";
import { SlideCommit } from "./slide-commit";

export default function Demo(p: Record<string, unknown>) {
  const [sent, setSent] = useState(0);
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-center">
        <p className="text-2xl font-semibold tabular-nums text-foreground">$1,240.00</p>
        <p className="text-xs text-muted-foreground">to Ana Reyes · ends 4821</p>
      </div>
      <SlideCommit label="Slide to pay" confirmedLabel="Paid" {...p} onCommit={() => setSent((n) => n + 1)} />
      <p className="text-xs text-muted-foreground">
        {sent ? `Payments sent: ${sent}` : "Drag to the end, or focus the knob and press End."}
      </p>
    </div>
  );
}
