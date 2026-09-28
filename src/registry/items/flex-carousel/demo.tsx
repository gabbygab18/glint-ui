"use client";

import { demoImages } from "../../demo-kit";
import { FlexCarousel } from "./flex-carousel";

const copy = [
  ["Still Water", "Mornings on a glacial lake before the wind wakes up."],
  ["Salt & Stone", "A coastline carved by a thousand quiet winters."],
  ["Old Growth", "Moss, mist and trees older than the maps."],
  ["City Rain", "Neon on wet asphalt, somewhere after midnight."],
  ["High Desert", "Dust, heat shimmer and endless horizon."],
  ["North Light", "Long shadows under a sun that never quite sets."],
];
const images = demoImages(6, 1000, 800);
const items = copy.map(([title, description], i) => ({ title, description, image: images[i] }));

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-full max-w-5xl">
      <FlexCarousel items={items} {...p} />
    </div>
  );
}
