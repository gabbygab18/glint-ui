"use client";

import { demoImages } from "../../demo-kit";
import { FogDeck } from "./fog-deck";

const copy = [
  ["Aurora", "Vol. 01 · North"],
  ["Meridian", "Vol. 02 · Noon"],
  ["Solstice", "Vol. 03 · Summer"],
  ["Driftwood", "Vol. 04 · Coast"],
  ["Halcyon", "Vol. 05 · Calm"],
  ["Ember", "Vol. 06 · Dusk"],
  ["Tidewater", "Vol. 07 · Shore"],
];
const images = demoImages(copy.length, 500, 660);
const items = copy.map(([title, subtitle], i) => ({ image: images[i], title, subtitle }));

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-full max-w-5xl">
      <FogDeck items={items} {...p} />
    </div>
  );
}
