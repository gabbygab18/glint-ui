"use client";

import { demoImages } from "../../demo-kit";
import { Folder } from "./folder";

const photos = demoImages(3, 300, 360).map((src) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img key={src} src={src} alt="" draggable={false} className="size-full object-cover p-[6%] pb-[22%]" />
));

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="pt-24">
      <Folder items={photos} {...p} />
    </div>
  );
}
