"use client";
/* eslint-disable @next/next/no-img-element */

import { demoImages } from "../../demo-kit";
import { CardSwap } from "./card-swap";

const images = demoImages(4, 700, 460);
const cards = [
  ["Smooth", "Springs all the way down"],
  ["Reliable", "Tested on every device"],
  ["Customizable", "Every prop is yours"],
  ["Fast", "60fps, zero jank"],
].map(([title, body], i) => (
  <div key={title} className="flex size-full flex-col">
    <div className="flex items-center gap-2 border-b border-border px-3 py-2">
      <span className="size-2.5 rounded-full bg-red-400/80" />
      <span className="size-2.5 rounded-full bg-amber-400/80" />
      <span className="size-2.5 rounded-full bg-emerald-400/80" />
      <span className="ml-2 text-sm font-medium text-foreground">{title}</span>
    </div>
    <div className="relative flex-1">
      <img src={images[i]} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <p className="absolute bottom-3 left-4 text-sm text-white/85">{body}</p>
    </div>
  </div>
));

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="translate-y-8">
      <CardSwap cards={cards} {...p} />
    </div>
  );
}
