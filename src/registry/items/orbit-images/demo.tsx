"use client";

import { demoImages } from "../../demo-kit";
import { OrbitImages } from "./orbit-images";

const images = demoImages(9, 300, 400);

export default function Demo(p: Record<string, unknown>) {
  return (
    <OrbitImages images={images} {...p} className="h-[26rem] w-full max-w-4xl">
      <div className="pointer-events-none text-center">
        <p className="text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">Community</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight whitespace-nowrap text-foreground sm:text-5xl">In orbit</p>
      </div>
    </OrbitImages>
  );
}
