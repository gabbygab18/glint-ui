"use client";

import { demoImages } from "../../demo-kit";
import { MotionCards } from "./motion-cards";

const images = demoImages(8, 480, 300);
const items = [
  ["Designing calm interfaces", "Why less motion often feels faster.", "Design", "Maya Chen · 6 min"],
  ["Edge caching in practice", "What we learned serving 2B requests a day.", "Engineering", "Leo Park · 11 min"],
  ["The weekly product review", "A lightweight ritual that keeps scope honest.", "Product", "Ana Ruiz · 4 min"],
  ["Typography for dashboards", "Tabular numbers, tight labels, loose rows.", "Design", "Priya Nair · 7 min"],
  ["Remote, but together", "How our team runs async across 9 time zones.", "Culture", "Jonas Berg · 5 min"],
  ["Postgres row-level security", "Multi-tenant auth without the footguns.", "Engineering", "Sam Okafor · 9 min"],
  ["Shipping on Fridays", "Feature flags turned the scariest day into a normal one.", "Product", "Leo Park · 5 min"],
  ["Hiring for taste", "The portfolio review we actually use.", "Culture", "Maya Chen · 8 min"],
].map(([title, description, tag, eyebrow], i) => ({ id: `post-${i}`, title, description, eyebrow, image: images[i], tags: [tag] }));

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="min-h-[37rem] w-full max-w-4xl px-4">
      <MotionCards items={items} {...p} />
    </div>
  );
}
