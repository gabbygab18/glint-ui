"use client";

import { SpotlightCard } from "./spotlight-card";

export default function Demo(p: Record<string, unknown>) {
  return (
    <SpotlightCard {...p} className="w-80">
      <h3 className="text-lg font-semibold text-foreground">Spotlight</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        A soft light follows your cursor across the surface of this card.
      </p>
    </SpotlightCard>
  );
}
