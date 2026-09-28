"use client";

import { useState } from "react";
import { demoImages } from "../../demo-kit";
import { RefineFrame, type CropRect } from "./refine-frame";

const [photo] = demoImages(1, 1600, 1000);

export default function Demo(p: Record<string, unknown>) {
  const [crop, setCrop] = useState<CropRect | null>(null);
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3 px-4">
      <RefineFrame src={photo} alt="Sample photo" {...p} onChange={setCrop} />
      <p className="font-mono text-xs text-muted-foreground">
        {crop ? `x ${crop.x} · y ${crop.y} · ${crop.width} × ${crop.height}` : "Drag the corners or the frame. Edges snap to thirds and center."}
      </p>
    </div>
  );
}
