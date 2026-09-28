"use client";

import { demoImages } from "../../demo-kit";
import { FlipStack } from "./flip-stack";

const photos = demoImages(5, 520, 640);
const cards = [
  ["Kyoto", "Autumn in Arashiyama", "01"],
  ["Lofoten", "Fishing huts at dusk", "02"],
  ["Lisbon", "Tram 28, Alfama", "03"],
  ["Oaxaca", "Mercado de Abastos", "04"],
  ["Reykjavík", "Harpa in blue hour", "05"],
].map(([city, caption, n], i) => (
  <div key={city} className="relative size-full bg-card">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={photos[i]} alt="" draggable={false} className="absolute inset-0 size-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent" />
    <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-0.5 font-mono text-[11px] text-white/90 backdrop-blur">{n} / 05</span>
    <div className="absolute inset-x-4 bottom-4 text-white">
      <p className="text-2xl font-semibold tracking-tight">{city}</p>
      <p className="text-sm text-white/70">{caption}</p>
    </div>
  </div>
));

const back = (
  <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_30%_20%,#312e81,#0b0b12_70%)] text-white">
    <div className="text-center">
      <p className="text-xs uppercase tracking-[.4em] text-white/50">Postcards</p>
      <p className="mt-2 font-serif text-3xl italic">Wish you were here</p>
    </div>
  </div>
);

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="mt-8 flex flex-col items-center gap-6">
      <FlipStack cards={cards} back={back} {...p} />
      <p className="text-sm text-muted-foreground">Click the stack to flip</p>
    </div>
  );
}
