"use client";

import { demoImages } from "../../demo-kit";
import { InfiniteMenu } from "./infinite-menu";

const copy = ["Aurora", "Nova", "Echo", "Vale", "Lumen", "Halo", "Drift", "Ember"].map((t, i) => [t, `Collection ${String(i + 1).padStart(2, "0")} · ${12 + i * 7} photos`]);
const images = demoImages(copy.length, 240, 240);
const items = copy.map(([title, description], i) => ({ title, description, image: images[i], href: "#" }));

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0">
      <InfiniteMenu items={items} {...p} />
    </div>
  );
}
