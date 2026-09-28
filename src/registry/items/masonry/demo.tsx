"use client";

import { demoImages } from "../../demo-kit";
import { Masonry } from "./masonry";

const ratios = [1.4, 0.8, 1.2, 1, 1.5, 0.75, 1.3, 0.9, 1.1, 1.45, 0.8, 1.25, 1, 1.35, 0.85, 1.2, 1.5, 0.9];
const titles = ["Dunes", "Harbor", "Canopy", "Tide", "Summit", "Alley", "Glacier", "Market", "Meadow", "Spire", "Delta", "Orchard", "Quarry", "Fjord", "Bazaar", "Grove", "Ridge", "Lagoon"];
const items = ratios.map((r, i) => ({
  src: demoImages(ratios.length, 600, Math.round(600 * r))[i],
  ratio: r,
  alt: titles[i],
}));

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0 overflow-y-auto p-6">
      <Masonry items={items} {...p} className="mx-auto max-w-5xl" />
    </div>
  );
}
