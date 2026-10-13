"use client";

import { PeekabooStars } from "./peekaboo-stars";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm font-medium text-foreground">How was your delivery?</p>
      <PeekabooStars key={String(p.defaultValue)} {...p} />
    </div>
  );
}
