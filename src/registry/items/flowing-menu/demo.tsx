"use client";

import { demoImages } from "../../demo-kit";
import { FlowingMenu } from "./flowing-menu";

const images = demoImages(4, 480, 240);
const items = ["Work", "Studio", "Journal", "Contact"].map((label, i) => ({ label, image: images[i] }));

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="h-[24rem] w-full max-w-5xl">
      <FlowingMenu items={items} {...p} />
    </div>
  );
}
