"use client";

import { Boxes, Gauge, Layers, Palette, ShieldCheck, Sparkles } from "lucide-react";
import { CursorHighlight } from "./cursor-highlight";

const links = ["Overview", "Components", "Pricing", "Changelog", "Docs"];
const tiles = [
  { icon: Sparkles, title: "Motion", body: "Springs, not tweens." },
  { icon: Palette, title: "Theming", body: "Tokens all the way." },
  { icon: Gauge, title: "Fast", body: "60fps, no layout thrash." },
  { icon: Layers, title: "Composable", body: "Wrap anything." },
  { icon: ShieldCheck, title: "Accessible", body: "Keyboard friendly." },
  { icon: Boxes, title: "Zero deps", body: "Just React." },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <CursorHighlight {...p} className="w-[min(34rem,100%)] rounded-3xl border border-border bg-card/60 p-4">
      <nav className="flex flex-wrap items-center gap-1 border-b border-border pb-4">
        {links.map((l) => (
          <a
            key={l}
            href="#"
            onClick={(e) => e.preventDefault()}
            className="rounded-xl px-3.5 py-2 text-sm text-muted-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors hover:text-foreground focus-visible:text-foreground"
          >
            {l}
          </a>
        ))}
      </nav>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {tiles.map(({ icon: Icon, title, body }) => (
          <button key={title} className="rounded-xl p-4 text-left outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <Icon className="size-5 text-foreground" strokeWidth={1.6} />
            <p className="mt-4 text-sm font-medium text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{body}</p>
          </button>
        ))}
      </div>
    </CursorHighlight>
  );
}
