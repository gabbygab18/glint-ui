"use client";

import { ArrowUpRight } from "lucide-react";
import { demoImages } from "../../demo-kit";
import { DriftCard } from "./drift-card";

const [image] = demoImages(1, 800, 1000);

export default function Demo(p: Record<string, unknown>) {
  return (
    <DriftCard
      image={image}
      eyebrow="Field notes · 04"
      title="Where the fog meets the ridge"
      description="A three-day traverse along the northern coast, shot on medium format."
      {...p}
    >
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
        Read story <ArrowUpRight className="size-4" />
      </span>
    </DriftCard>
  );
}
