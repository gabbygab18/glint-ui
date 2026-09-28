"use client";

import { DepthText } from "./depth-text";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <DepthText {...p} className="text-8xl font-black tracking-tight sm:text-[10rem]" />
    </div>
  );
}
