"use client";

import { demoImages } from "../../demo-kit";
import { Carousel } from "./carousel";

const copy = [
  ["Northern Ridge", "A slow climb through larch and granite."],
  ["Salt Flats", "Mirror-still water after the rain."],
  ["Old Harbour", "Fishing boats and morning fog."],
  ["Cedar Trail", "Twelve kilometres of quiet forest."],
  ["Glass Lake", "Swim at dawn, before the wind."],
  ["Dune Sea", "Walk the ridgeline at golden hour."],
];
const images = demoImages(copy.length, 600, 500);
const items = copy.map(([title, description], i) => ({ image: images[i], title, description }));

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-full max-w-5xl">
      <Carousel items={items} {...p} startIndex={2} />
    </div>
  );
}
