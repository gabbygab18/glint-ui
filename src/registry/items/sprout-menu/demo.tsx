"use client";

import { useState } from "react";
import { SproutMenu } from "./sprout-menu";

export default function Demo(p: Record<string, unknown>) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="grid justify-items-center gap-2">
      <SproutMenu {...p} onSelect={(item) => setPicked(item.label)} />
      <p className="h-5 text-sm text-muted-foreground" aria-live="polite">
        {picked ? `New ${picked.toLowerCase()} created` : "Tap + to branch out"}
      </p>
    </div>
  );
}
