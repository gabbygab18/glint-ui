"use client";

import { demoImages } from "../../demo-kit";
import { BendRibbon } from "./bend-ribbon";

const words = ["Aurora", "Meridian", "Solstice", "Driftwood", "Halcyon", "Ember", "Tidewater", "Northbound"];
const images = demoImages(words.length, 480, 600);
const items = words.map((text, i) => ({ image: images[i], text }));

export default function Demo(p: Record<string, unknown>) {
  return <BendRibbon items={items} {...p} />;
}
