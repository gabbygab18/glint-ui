"use client";

import { Loader, type LoaderVariant } from "./loader";

const variants: LoaderVariant[] = ["spinner", "dots", "bars", "pulse", "orbit"];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-10">
      <Loader className="text-foreground" {...p} size={Number(p.size ?? 32) * 2} />
      <div className="grid grid-cols-5 gap-4">
        {variants.map((v) => (
          <div key={v} className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-4 py-4">
            <Loader variant={v} size={28} speed={Number(p.speed ?? 1)} className="text-foreground" />
            <span className="text-xs text-muted-foreground">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
