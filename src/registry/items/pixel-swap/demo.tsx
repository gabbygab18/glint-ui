"use client";

import { demoImages } from "../../demo-kit";
import { PixelSwap } from "./pixel-swap";

const img = demoImages(6, 600, 800);
const cards = [
  { name: "Aster", role: "Field recorder", a: img[0], b: img[3] },
  { name: "Juno", role: "Set designer", a: img[1], b: img[4] },
  { name: "Mika", role: "Photographer", a: img[2], b: img[5] },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {cards.map((c) => (
        <figure key={c.name} className="w-52 sm:w-56">
          <PixelSwap src={c.a} hoverSrc={c.b} alt={`${c.name}, ${c.role}`} {...p} className="aspect-[3/4] w-full rounded-2xl bg-muted" />
          <figcaption className="mt-3 flex items-baseline justify-between px-1">
            <span className="text-sm font-medium text-foreground">{c.name}</span>
            <span className="text-xs text-muted-foreground">{c.role}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
