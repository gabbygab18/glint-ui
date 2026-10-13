"use client";

import { demoImages } from "../../demo-kit";
import { PanelGlide } from "./panel-glide";

const places = [
  ["Kyoto", "Temples at dawn"],
  ["Lofoten", "Arctic light"],
  ["Atacama", "Salt & silence"],
  ["Tbilisi", "Old town rooftops"],
  ["Azores", "Volcanic green"],
  ["Hokkaido", "First snow"],
];
const images = demoImages(places.length, 900, 900);
const items = places.map(([title, subtitle], i) => ({ src: images[i], title, subtitle }));

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-full max-w-4xl">
      <PanelGlide items={items} {...p} />
    </div>
  );
}
