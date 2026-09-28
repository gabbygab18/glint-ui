"use client";

import { Gauge, ShieldCheck, Sparkles } from "lucide-react";
import { PixelHighlight } from "./pixel-highlight";

const cards = [
  { icon: Gauge, title: "Fast by default", body: "Edge-cached pages that load before you finish blinking." },
  { icon: ShieldCheck, title: "Secure", body: "Row-level policies and audit logs out of the box." },
  { icon: Sparkles, title: "Delightful", body: "Micro-interactions that make people smile." },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {cards.map(({ icon: Icon, title, body }) => (
        <PixelHighlight
          key={title}
          {...p}
          className="w-60 rounded-2xl border border-border bg-card focus-within:ring-2 focus-within:ring-ring"
        >
          <div tabIndex={0} className="p-6 outline-none">
            <Icon className="mb-12 size-6 text-foreground" aria-hidden />
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        </PixelHighlight>
      ))}
    </div>
  );
}
