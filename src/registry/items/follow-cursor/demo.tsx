"use client";

import { demoImages } from "../../demo-kit";
import { FollowCursor } from "./follow-cursor";

const [img] = demoImages(1, 900, 600);

export default function Demo(p: Record<string, unknown>) {
  return (
    <FollowCursor {...p} className="w-[26rem] max-w-full overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt="" className="aspect-[3/2] w-full object-cover" />
      <div className="flex items-end justify-between p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Case study · 2026</p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">Northfield brand system</h3>
        </div>
        <span className="text-sm text-muted-foreground">01</span>
      </div>
    </FollowCursor>
  );
}
