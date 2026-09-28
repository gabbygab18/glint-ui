"use client";

import { demoImages } from "../../demo-kit";
import { ChromaGrid } from "./chroma-grid";

const people = [
  ["Mara Quinn", "Design Engineer", "@mara", "#3b82f6"],
  ["Theo Lindqvist", "Backend Lead", "@theo", "#10b981"],
  ["Ines Duarte", "Product Designer", "@ines", "#f59e0b"],
  ["Kenji Mori", "Motion Designer", "@kenji", "#ef4444"],
  ["Sade Okafor", "Staff Engineer", "@sade", "#8b5cf6"],
  ["Luca Ferri", "DevRel", "@luca", "#06b6d4"],
];
const images = demoImages(12, 480, 360).slice(6);
const items = people.map(([title, subtitle, handle, color], i) => ({ image: images[i], title, subtitle, handle, color }));

export default function Demo(p: Record<string, unknown>) {
  return <ChromaGrid items={items} {...p} />;
}
