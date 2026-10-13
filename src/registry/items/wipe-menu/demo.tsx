"use client";

import { demoImages } from "../../demo-kit";
import { WipeMenu } from "./wipe-menu";

const images = demoImages(4, 480, 240);
const items = ["Work", "Studio", "Journal", "Contact"].map((label, i) => ({ label, image: images[i] }));

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="h-[24rem] w-full max-w-5xl">
      <WipeMenu items={items} {...p} />
    </div>
  );
}
